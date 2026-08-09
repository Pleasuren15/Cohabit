using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.application.Domain;

namespace cohabit.api.Services;

public interface IAuthService
{
    /// <summary>
    ///     Upserts the user identified by the JWT into the internal database and,
    ///     on the very first sync, sends the welcome message to their Messages tab.
    /// </summary>
    Task<UserDto> SyncAsync(JwtUserProfile profile, CancellationToken ct = default);
}

public sealed class AuthService(
    IUserAccessor userAccessor,
    ICache cache,
    ISystemMessagingService messagingService,
    ILogger<AuthService> logger) : IAuthService
{
    public const string WelcomeTitle = "Welcome to Cohabit";
    public const string WelcomeContent =
        "Welcome to Cohabit! Your account has been created successfully. Start exploring shared living spaces near you!";

    public async Task<UserDto> SyncAsync(JwtUserProfile profile, CancellationToken ct = default)
    {
        var (user, isNew) = await userAccessor.SyncFromJwtAsync(profile, ct);

        if (isNew)
        {
            logger.LogInformation("Synced new user {UserId} ({Email}) from JWT", user.Id, user.Email);
            await messagingService.SendAsync(user.Id, WelcomeTitle, WelcomeContent, ct: ct);
        }
        else
        {
            logger.LogInformation("User {UserId} already synced; refreshed profile from JWT", user.Id);
        }

        cache.Remove(CacheKeys.UsersList);

        return ToDto(user);
    }

    private static UserDto ToDto(User user)
    {
        return new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Cellphone,
            user.Email,
            user.DateOfBirth,
            user.Gender,
            user.Bio,
            user.AvatarUrl,
            user.IsOtpVerified,
            user.AddressId,
            user.Timestamp);
    }
}
