using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using cohabit.comms.api.Features.Messaging.Sms;
using cohabit.comms.api.Features.Otp;
using comms.api.integration.tests.Helpers;
using comms.api.integration.tests.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using WireMock.RequestBuilders;

namespace comms.api.integration.tests.TestCases;

public class OtpRequestIntegrationTests
{
    private const string Issuer = "cohabit-tests";
    private const string Audience = "cohabit-tests";
    private const string SigningKey = "cohabit-test-signing-key-at-least-32-characters";
    private const string SmsPortalUsername = "integration-tests";
    private const string SmsPortalPassword = "integration-tests-password";
    private const string Cellphone = "+15551234567";

    private static readonly JsonSerializerOptions ResponseJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private static WebApplicationFactory<Program> CreateFactory(string? smsPortalBaseUrl = null)
    {
        var config = new Dictionary<string, string?>
        {
            ["Jwt:Issuer"] = Issuer,
            ["Jwt:Audience"] = Audience,
            ["Jwt:SigningKey"] = SigningKey
        };

        if (smsPortalBaseUrl is not null)
        {
            config["SmsPortal:BaseUrl"] = $"{smsPortalBaseUrl}/BulkMessages";
            config["SmsPortal:Username"] = SmsPortalUsername;
            config["SmsPortal:Password"] = SmsPortalPassword;
        }

        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
                builder.ConfigureAppConfiguration((_, configuration) =>
                    configuration.AddInMemoryCollection(config)));
    }

    private static string CreateToken(string userId, string? cellphone = null, string? email = null)
    {
        var claims = new List<Claim> { new(JwtClaims.UserId, userId) };
        if (cellphone is not null)
            claims.Add(new Claim(JwtClaims.Cellphone, cellphone));
        if (email is not null)
            claims.Add(new Claim(JwtClaims.Email, email));

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Test]
    public async Task Given_NoAuthorizationHeader_When_PostingRequestOtp_Then_ReturnsUnauthorized()
    {
        // Arrange
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task Given_OutOfRangeChannel_When_PostingRequestOtp_Then_ReturnsBadRequest()
    {
        // Arrange
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = 999 });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Given_MalformedCode_When_PostingVerifyOtp_Then_ReturnsBadRequest()
    {
        // Arrange
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/verify", new { channel = "Sms", code = "12ab" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Given_TokenMissingCellphone_When_RequestingOtpBySms_Then_ReturnsBadRequest()
    {
        // Arrange
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), email: "user@example.com"));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Given_SmsPortalAcceptsSms_When_RequestingOtpBySms_Then_ReturnsOk_AndDeliversSmsToPortal()
    {
        // Arrange
        using var wireMock = new SmsPortalWireMockServer();
        SmsPortalStubBuilder.RespondWithSuccess(wireMock.Server);
        using var factory = CreateFactory(wireMock.BaseUrl);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var body = await response.Content.ReadFromJsonAsync<SendOtpResponse>(ResponseJsonOptions);
        Assert.That(body!.Channel, Is.EqualTo(OtpChannel.Sms));
        Assert.That(body.Destination, Is.EqualTo("+15***67"));

        var sent = wireMock.Server.FindLogEntries(Request.Create().WithPath("/BulkMessages").UsingPost())
            .ToList();
        Assert.That(sent, Has.Count.EqualTo(1));

        using var requestJson = JsonDocument.Parse(sent[0].RequestMessage.Body);
        var message = requestJson.RootElement.GetProperty("messages")[0];
        Assert.That(message.GetProperty("destination").GetString(), Is.EqualTo("15551234567"));
        Assert.That(message.GetProperty("content").GetString(), Does.Match(@"^Cohabit > Your OTP is \d{6}$"));

        var expectedAuth = $"Basic {Convert.ToBase64String(Encoding.UTF8.GetBytes($"{SmsPortalUsername}:{SmsPortalPassword}"))}";
        Assert.That(sent[0].RequestMessage.Headers["Authorization"][0], Is.EqualTo(expectedAuth));
    }

    [Test]
    public async Task Given_OtpSentBySms_When_VerifyingWithSentCode_Then_ReturnsValid_AndConsumesCode()
    {
        // Arrange
        using var wireMock = new SmsPortalWireMockServer();
        SmsPortalStubBuilder.RespondWithSuccess(wireMock.Server);
        using var factory = CreateFactory(wireMock.BaseUrl);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        var requestResponse = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        Assert.That(requestResponse.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var sent = wireMock.Server.FindLogEntries(Request.Create().WithPath("/BulkMessages").UsingPost())
            .Single();
        using var requestJson = JsonDocument.Parse(sent.RequestMessage.Body);
        var code = requestJson.RootElement.GetProperty("messages")[0]
            .GetProperty("content").GetString()![^6..];

        // Act
        var verifyResponse = await client.PostAsJsonAsync("/api/otp/verify", new { channel = "Sms", code });

        // Assert
        Assert.That(verifyResponse.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var verifyBody = await verifyResponse.Content.ReadFromJsonAsync<VerifyOtpResponse>(ResponseJsonOptions);
        Assert.That(verifyBody!.IsValid, Is.True);

        var replayedResponse = await client.PostAsJsonAsync("/api/otp/verify", new { channel = "Sms", code });
        var replayedBody = await replayedResponse.Content.ReadFromJsonAsync<VerifyOtpResponse>(ResponseJsonOptions);
        Assert.That(replayedBody!.IsValid, Is.False);
    }

    [Test]
    public async Task Given_NoOtpIssued_When_VerifyingWithRandomCode_Then_ReturnsInvalid()
    {
        // Arrange
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/verify", new { channel = "Sms", code = "123456" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var body = await response.Content.ReadFromJsonAsync<VerifyOtpResponse>(ResponseJsonOptions);
        Assert.That(body!.IsValid, Is.False);
    }

    [Test]
    public async Task Given_SmsPortalReturnsError_When_RequestingOtpBySms_Then_ReturnsInternalServerError()
    {
        // Arrange
        using var wireMock = new SmsPortalWireMockServer();
        SmsPortalStubBuilder.RespondWithServerError(wireMock.Server);
        using var factory = CreateFactory(wireMock.BaseUrl);
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.InternalServerError));
    }

    [Test]
    public async Task Given_SmsPortalUnreachable_When_RequestingOtpBySms_Then_ReturnsInternalServerError()
    {
        // Arrange
        using var factory = CreateFactory("http://127.0.0.1:1");
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.InternalServerError));
    }

    [Test]
    public async Task Given_SameUser_When_RequestingOtpThreeTimes_Then_ThirdRequestIsRejected()
    {
        // Arrange
        using var factory = CreateRateLimitedFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var first = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var second = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var third = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(first.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(second.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(third.StatusCode, Is.EqualTo(HttpStatusCode.TooManyRequests));
    }

    [Test]
    public async Task Given_DifferentUsers_When_EachRequestsOtpTwice_Then_NeitherIsRejected()
    {
        // Arrange
        using var factory = CreateRateLimitedFactory();
        using var clientA = factory.CreateClient();
        using var clientB = factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), cellphone: Cellphone));

        // Act
        var a1 = await clientA.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var b1 = await clientB.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var a2 = await clientA.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var b2 = await clientB.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        // Assert
        Assert.That(a1.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(b1.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(a2.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(b2.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    private static WebApplicationFactory<Program> CreateRateLimitedFactory()
    {
        return CreateFactory()
            .WithWebHostBuilder(builder =>
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll<ISmsProvider>();
                    services.AddSingleton<ISmsProvider, StubSmsProvider>();
                }));
    }

    private sealed class StubSmsProvider : ISmsProvider
    {
        public Task SendAsync(SmsMessage message, CancellationToken ct = default)
            => Task.CompletedTask;
    }
}
