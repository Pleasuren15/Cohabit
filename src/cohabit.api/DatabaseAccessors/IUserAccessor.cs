using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IUserAccessor
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);

    Task<User> CreateAsync(CreateUserRequest request, CancellationToken ct = default);

    Task<User> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid userId, CancellationToken ct = default);
}
