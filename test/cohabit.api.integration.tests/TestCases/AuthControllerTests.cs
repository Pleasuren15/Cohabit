using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class AuthControllerTests : ApiTestBase
{
    [Test]
    public async Task Given_ValidToken_When_SyncIsInvoked_Then_UserIsCreatedAndWelcomeMessageSent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = TestJwt.CreateToken(userId, metadata: new
        {
            full_name = "Jane Smith",
            first_name = "Jane",
            last_name = "Smith",
            date_of_birth = "1995-01-01",
            province = "gp"
        });

        // Act
        var response = await PostSyncAsync(token);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        user!.Id.Should().Be(userId);
        user.FirstName.Should().Be("Jane");
        user.LastName.Should().Be("Smith");
        user.Email.Should().Be("jane@example.com");
        user.Cellphone.Should().Be("0812345678");
        user.DateOfBirth.Should().Be(DateOnly.Parse("1995-01-01"));

        var welcome = await GetMessagesAsync(userId);
        welcome.Should().ContainSingle()
            .Which.Title.Should().Be("Welcome to Cohabit");
    }

    [Test]
    public async Task Given_SyncedUser_When_SyncIsInvokedAgain_Then_IsIdempotentAndNoSecondWelcome()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = TestJwt.CreateToken(userId);
        await PostSyncAsync(token);

        // Act
        var response = await PostSyncAsync(token);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var messages = await GetMessagesAsync(userId);
        messages.Count(m => m.Title == "Welcome to Cohabit").Should().Be(1);
    }

    [Test]
    public async Task Given_ValidToken_When_SyncIsInvoked_Then_ExistingProfileIsRefreshed()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var first = TestJwt.CreateToken(userId, email: "jane@example.com", metadata: new
        {
            full_name = "Jane Smith",
            date_of_birth = "1995-01-01"
        });
        await PostSyncAsync(first);

        var second = TestJwt.CreateToken(userId, email: "jane.smith@example.com", metadata: new
        {
            full_name = "Jane Anne Smith",
            date_of_birth = "1995-01-01"
        });

        // Act
        var response = await PostSyncAsync(second);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var users = await Client.GetFromJsonAsync<List<UserDto>>("/api/users");
        var stored = users!.Single(u => u.Id == userId);
        stored.Email.Should().Be("jane.smith@example.com");
        stored.FirstName.Should().Be("Jane");
        stored.LastName.Should().Be("Anne Smith");
    }

    [Test]
    public async Task Given_NoToken_When_SyncIsInvoked_Then_ReturnsUnauthorized()
    {
        // Arrange

        // Act
        var response = await Client.PostAsync("/api/auth/sync", content: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Given_ExpiredToken_When_SyncIsInvoked_Then_ReturnsUnauthorized()
    {
        // Arrange
        var token = TestJwt.CreateToken(Guid.NewGuid(), expires: DateTime.UtcNow.AddMinutes(-10));

        // Act
        var response = await PostSyncAsync(token);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Given_TokenSignedWithWrongKey_When_SyncIsInvoked_Then_ReturnsUnauthorized()
    {
        // Arrange — a well-formed token signed with a different secret.
        var wrong = TestJwt.CreateToken(
            Guid.NewGuid(),
            signingKey: "a-completely-different-secret-key-1234567890");

        // Act
        var response = await PostSyncAsync(wrong);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private Task<HttpResponseMessage> PostSyncAsync(string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/sync");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return Client.SendAsync(request);
    }

    private async Task<List<SystemMessageDto>> GetMessagesAsync(Guid userId)
    {
        var response = await Client.GetAsync($"/api/users/{userId}/messages");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        return (await response.Content.ReadFromJsonAsync<List<SystemMessageDto>>())!;
    }
}
