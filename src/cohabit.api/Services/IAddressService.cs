using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> SearchAsync(AddressQuery query, CancellationToken ct = default);

    Task<AddressDto> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<AddressDto> CreateAsync(CreateAddressRequest request, CancellationToken ct = default);

    Task<AddressDto> UpdateAsync(Guid id, UpdateAddressRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
