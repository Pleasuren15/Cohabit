using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.application.Domain;

namespace cohabit.api.unit.tests;

internal sealed class CountingUserAccessor(IUserAccessor inner) : IUserAccessor
{
    public int GetAllCalls { get; private set; }

    public int CreateCalls { get; private set; }

    public int UpdateCalls { get; private set; }

    public int DeleteCalls { get; private set; }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default)
    {
        GetAllCalls++;
        return await inner.GetAllAsync(ct);
    }

    public async Task<User> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        CreateCalls++;
        return await inner.CreateAsync(request, ct);
    }

    public async Task<User> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default)
    {
        UpdateCalls++;
        return await inner.UpdateAsync(userId, request, ct);
    }

    public async Task DeleteAsync(Guid userId, CancellationToken ct = default)
    {
        DeleteCalls++;
        await inner.DeleteAsync(userId, ct);
    }
}
