using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> GetAllAsync(CancellationToken ct = default);

    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);

    Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid userId, CancellationToken ct = default);
}
