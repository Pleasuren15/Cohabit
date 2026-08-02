using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IAddressAccessor
{
    Task<IReadOnlyList<Address>> SearchAsync(AddressQuery query, CancellationToken ct = default);

    Task<Address?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<Address> CreateAsync(CreateAddressRequest request, CancellationToken ct = default);

    Task<Address> UpdateAsync(Guid id, UpdateAddressRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
