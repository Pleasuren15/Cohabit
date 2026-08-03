using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using cohabit.comms.api.Features.BulkSms;
using cohabit.comms.api.Features.Otp;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace comms.api.integration.tests;

public class OtpRequestIntegrationTests
{
    private const string Issuer = "cohabit-tests";
    private const string Audience = "cohabit-tests";
    private const string SigningKey = "cohabit-test-signing-key-at-least-32-characters";

    private static WebApplicationFactory<Program> CreateFactory()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
                builder.ConfigureAppConfiguration((_, config) =>
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["Jwt:Issuer"] = Issuer,
                        ["Jwt:Audience"] = Audience,
                        ["Jwt:SigningKey"] = SigningKey
                    })));
    }

    private static string CreateToken(string userId, string cellphone)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtClaims.UserId, userId),
            new Claim(JwtClaims.Cellphone, cellphone)
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Test]
    public async Task Given_NoAuthorizationHeader_When_PostingRequestOtp_Then_ReturnsUnauthorized()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task Given_OutOfRangeChannel_When_PostingRequestOtp_Then_ReturnsBadRequest()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), "+15551234567"));

        var response = await client.PostAsJsonAsync("/api/otp/request", new { channel = 999 });

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Given_MalformedCode_When_PostingVerifyOtp_Then_ReturnsBadRequest()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), "+15551234567"));

        var response = await client.PostAsJsonAsync("/api/otp/verify", new { channel = "Sms", code = "12ab" });

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Given_SameUser_When_RequestingOtpThreeTimes_Then_ThirdRequestIsRejected()
    {
        using var factory = CreateRateLimitedFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), "+15551234567"));

        var first = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var second = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var third = await client.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

        Assert.That(first.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(second.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(third.StatusCode, Is.EqualTo(HttpStatusCode.TooManyRequests));
    }

    [Test]
    public async Task Given_DifferentUsers_When_EachRequestsOtpTwice_Then_NeitherIsRejected()
    {
        using var factory = CreateRateLimitedFactory();
        using var clientA = factory.CreateClient();
        using var clientB = factory.CreateClient();
        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), "+15551234567"));
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateToken(Guid.NewGuid().ToString(), "+15551234567"));

        var a1 = await clientA.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var b1 = await clientB.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var a2 = await clientA.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });
        var b2 = await clientB.PostAsJsonAsync("/api/otp/request", new { channel = "Sms" });

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
                    services.RemoveAll<IBulkSmsClient>();
                    services.AddSingleton<IBulkSmsClient, StubBulkSmsClient>();
                }));
    }

    private sealed class StubBulkSmsClient : IBulkSmsClient
    {
        public Task<BulkSmsMessageDto> SendAsync(SendSmsRequest request, CancellationToken ct = default)
            => Task.FromResult(new BulkSmsMessageDto(
                "msg-id", "sms", null, request.To, request.Body, null, null, null, null, null, null, null, null, null));

        public Task<IReadOnlyList<BulkSmsMessageDto>> GetAllAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<BulkSmsMessageDto>>(Array.Empty<BulkSmsMessageDto>());

        public Task<BulkSmsMessageDto?> GetByIdAsync(string id, CancellationToken ct = default)
            => Task.FromResult<BulkSmsMessageDto?>(null);
    }
}
