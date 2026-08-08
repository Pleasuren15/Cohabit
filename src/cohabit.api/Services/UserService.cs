using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.application.Domain;

namespace cohabit.api.Services;

public sealed class UserService(
    IUserAccessor userAccessor,
    ICache cache,
    ISystemMessagingService messagingService,
    ILogger<UserService> logger) : IUserService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await cache.GetOrSetAsync(CacheKeys.UsersList, async token =>
        {
            var users = await userAccessor.GetAllAsync(token);
            return users.Select(ToDto).ToList();
        }, CacheTtl, ct);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var user = await userAccessor.CreateAsync(request, ct);
        logger.LogInformation("Created user {UserId} ({Email})", user.Id, user.Email);

        await messagingService.SendAsync(
            user.Id,
            "Welcome to Cohabit",
            "Your account has been created successfully. Start exploring shared living spaces near you!");

        cache.Remove(CacheKeys.UsersList);

        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await userAccessor.UpdateAsync(userId, request, ct);
        logger.LogInformation("Updated user {UserId} ({Email})", user.Id, user.Email);

        cache.Remove(CacheKeys.UsersList);

        return ToDto(user);
    }

    public async Task DeleteAsync(Guid userId, CancellationToken ct = default)
    {
        await userAccessor.DeleteAsync(userId, ct);
        logger.LogInformation("Deleted user {UserId}", userId);

        cache.Remove(CacheKeys.UsersList);
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
