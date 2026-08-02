using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.application.Domain;

namespace cohabit.api.unit.tests;

internal sealed class CountingAddressAccessor(IAddressAccessor inner) : IAddressAccessor
{
    public int SearchCalls { get; private set; }

    public int GetByIdCalls { get; private set; }

    public int CreateCalls { get; private set; }

    public int UpdateCalls { get; private set; }

    public int DeleteCalls { get; private set; }

    public async Task<IReadOnlyList<Address>> SearchAsync(AddressQuery query, CancellationToken ct = default)
    {
        SearchCalls++;
        return await inner.SearchAsync(query, ct);
    }

    public async Task<Address?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        GetByIdCalls++;
        return await inner.GetByIdAsync(id, ct);
    }

    public async Task<Address> CreateAsync(CreateAddressRequest request, CancellationToken ct = default)
    {
        CreateCalls++;
        return await inner.CreateAsync(request, ct);
    }

    public async Task<Address> UpdateAsync(Guid id, UpdateAddressRequest request, CancellationToken ct = default)
    {
        UpdateCalls++;
        return await inner.UpdateAsync(id, request, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        DeleteCalls++;
        await inner.DeleteAsync(id, ct);
    }
}
