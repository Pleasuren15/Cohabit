using System.Security.Claims;
using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using cohabit.application.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class AuthControllerTests
{
    private const string Metadata =
        """{"full_name":"Jane Smith","first_name":"Jane","last_name":"Smith","date_of_birth":"1995-01-01","province":"gp","avatar_url":"https://example.com/avatar.png"}""";

    [Test]
    public async Task Given_ValidClaims_When_SyncIsInvoked_Then_ReturnsOkWithSyncedUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var (controller, db, _) = CreateSystemUnderTestAsync(userId);

        // Act
        var result = await controller.Sync(CancellationToken.None);

        // Assert
        var user = Unwrap(result);
        user.Id.Should().Be(userId);
        user.FirstName.Should().Be("Jane");
        user.LastName.Should().Be("Smith");
        user.Email.Should().Be("jane@example.com");
        user.Cellphone.Should().Be("0812345678");
        user.DateOfBirth.Should().Be(DateOnly.Parse("1995-01-01"));
        user.AvatarUrl.Should().Be("https://example.com/avatar.png");
        user.AddressId.Should().BeNull();

        db.Users.Should().ContainSingle(u => u.Id == userId);
    }

    [Test]
    public async Task Given_ValidClaims_When_SyncIsInvokedTwice_Then_WelcomeIsSentOnce()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var (controller, _, messaging) = CreateSystemUnderTestAsync(userId);

        // Act
        await controller.Sync(CancellationToken.None);
        await controller.Sync(CancellationToken.None);

        // Assert
        messaging.Sent.Should().ContainSingle();
        messaging.Sent[0].UserId.Should().Be(userId);
        messaging.Sent[0].Title.Should().Be(AuthService.WelcomeTitle);
    }

    [Test]
    public async Task Given_ExistingUser_When_SyncIsInvokedWithUpdatedClaims_Then_ProfileIsRefreshed()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var (controller, db, messaging) = CreateSystemUnderTestAsync(userId);
        await controller.Sync(CancellationToken.None);

        // Act — simulate a later login with an updated name/phone.
        SetPrincipal(controller, userId, "jane.new@example.com", "0821112222");
        await controller.Sync(CancellationToken.None);

        // Assert
        var stored = db.Users.Single(u => u.Id == userId);
        stored.Email.Should().Be("jane.new@example.com");
        stored.Cellphone.Should().Be("0821112222");
        stored.FirstName.Should().Be("Jane");
        messaging.Sent.Should().ContainSingle();
    }

    [Test]
    public async Task Given_MissingSubClaim_When_SyncIsInvoked_Then_ReturnsUnauthorized()
    {
        // Arrange
        var (controller, _, _) = CreateSystemUnderTestAsync(Guid.NewGuid());
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("email", "x@y.z")], "test"))
            }
        };

        // Act
        var result = await controller.Sync(CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Test]
    public void Given_FullNameOnly_When_TryGetProfileIsInvoked_Then_FirstNameAndLastNameAreSplit()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", userId.ToString()),
            new Claim("email", "jane@example.com"),
            new Claim("user_metadata", """{"full_name":"Jane Ann Smith"}""")
        ], "test"));

        // Act
        var ok = AuthController.TryGetProfile(principal, out var profile);

        // Assert
        ok.Should().BeTrue();
        profile.FirstName.Should().Be("Jane");
        profile.LastName.Should().Be("Ann Smith");
        profile.DateOfBirth.Should().BeNull();
        profile.Gender.Should().Be('U');
    }

    [Test]
    public void Given_NoSubClaim_When_TryGetProfileIsInvoked_Then_ReturnsFalse()
    {
        // Arrange
        var principal = new ClaimsPrincipal(new ClaimsIdentity([], "test"));

        // Act
        var ok = AuthController.TryGetProfile(principal, out _);

        // Assert
        ok.Should().BeFalse();
    }

    [Test]
    public async Task Given_NewUser_When_ServiceSyncIsInvoked_Then_UserIsCreatedAndWelcomeSent()
    {
        // Arrange
        var (service, accessor, db, messaging) = CreateServiceUnderTestAsync();
        var profile = Profile(Guid.NewGuid());

        // Act
        var dto = await service.SyncAsync(profile, CancellationToken.None);

        // Assert
        accessor.SyncCalls.Should().Be(1);
        db.Users.Should().ContainSingle(u => u.Id == profile.UserId);
        messaging.Sent.Should().ContainSingle()
            .Which.UserId.Should().Be(profile.UserId);
        dto.Id.Should().Be(profile.UserId);
    }

    [Test]
    public async Task Given_ExistingUser_When_ServiceSyncIsInvoked_Then_NoSecondWelcomeIsSent()
    {
        // Arrange
        var (service, _, _, messaging) = CreateServiceUnderTestAsync();
        var profile = Profile(Guid.NewGuid());

        // Act
        await service.SyncAsync(profile, CancellationToken.None);
        await service.SyncAsync(profile, CancellationToken.None);

        // Assert
        messaging.Sent.Should().ContainSingle();
    }

    [Test]
    public async Task Given_SyncedUser_When_AccessorSyncIsInvokedAgain_Then_ReturnsExistingNotNew()
    {
        // Arrange
        var db = TestData.CreateDbContext();
        var accessor = new UserAccessor(db);
        var profile = Profile(Guid.NewGuid());

        // Act
        var first = await accessor.SyncFromJwtAsync(profile);
        var second = await accessor.SyncFromJwtAsync(profile);

        // Assert
        first.IsNew.Should().BeTrue();
        second.IsNew.Should().BeFalse();
        second.User.Id.Should().Be(profile.UserId);
        db.Users.Should().ContainSingle(u => u.Id == profile.UserId);
    }

    private static (AuthController Controller, CohabitDbContext Db, RecordingSystemMessagingService Messaging) CreateSystemUnderTestAsync(Guid userId)
    {
        var db = TestData.CreateDbContext();
        var messaging = new RecordingSystemMessagingService();
        var service = new AuthService(
            new UserAccessor(db),
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            messaging,
            NullLogger<AuthService>.Instance);
        var controller = new AuthController(service);
        SetPrincipal(controller, userId, "jane@example.com", "0812345678");
        return (controller, db, messaging);
    }

    private static (AuthService Service, CountingUserAccessor Accessor, CohabitDbContext Db, RecordingSystemMessagingService Messaging) CreateServiceUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var accessor = new CountingUserAccessor(new UserAccessor(db));
        var messaging = new RecordingSystemMessagingService();
        var service = new AuthService(
            accessor,
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            messaging,
            NullLogger<AuthService>.Instance);
        return (service, accessor, db, messaging);
    }

    private static JwtUserProfile Profile(Guid userId) =>
        new(userId, "Jane", "Smith", "jane@example.com", "0812345678", DateOnly.Parse("1995-01-01"), 'F', null);

    private static void SetPrincipal(AuthController controller, Guid userId, string email, string phone)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim("sub", userId.ToString()),
                    new Claim("email", email),
                    new Claim("phone", phone),
                    new Claim("user_metadata", Metadata)
                ], "test"))
            }
        };
    }

    private static UserDto Unwrap(ActionResult<UserDto> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<UserDto>();
        return (UserDto)ok.Value!;
    }
}
