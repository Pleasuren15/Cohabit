using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IUserAccessor
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);

    Task<User> CreateAsync(CreateUserRequest request, CancellationToken ct = default);

    Task<User> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    ///     Upserts a user from an authenticated JWT. Returns the stored user and
    ///     whether this call created them (i.e. the first-ever sync).
    /// </summary>
    Task<(User User, bool IsNew)> SyncFromJwtAsync(JwtUserProfile profile, CancellationToken ct = default);
}
