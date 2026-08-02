using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.application.Domain;

namespace cohabit.api.Services;

public sealed class AddressService(
    IAddressAccessor addressAccessor,
    ICache cache,
    ILogger<AddressService> logger) : IAddressService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<IReadOnlyList<AddressDto>> SearchAsync(AddressQuery query, CancellationToken ct = default)
    {
        var key = CacheKeys.AddressBrowse(query);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var addresses = await addressAccessor.SearchAsync(query, token);
            return addresses.Select(ToDto).ToList();
        }, CacheTtl, ct);
    }

    public async Task<AddressDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var key = CacheKeys.AddressDetail(id);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var address = await addressAccessor.GetByIdAsync(id, token);
            if (address is null)
            {
                logger.LogWarning("Address {AddressId} was not found", id);
                throw new NotFoundException("address_not_found", $"Address '{id}' was not found.");
            }

            return ToDto(address);
        }, CacheTtl, ct);
    }

    public async Task<AddressDto> CreateAsync(CreateAddressRequest request, CancellationToken ct = default)
    {
        var address = await addressAccessor.CreateAsync(request, ct);
        logger.LogInformation("Created address {AddressId}", address.Id);

        cache.RemoveByPrefix(CacheKeys.AddressBrowsePrefix);

        return ToDto(address);
    }

    public async Task<AddressDto> UpdateAsync(Guid id, UpdateAddressRequest request, CancellationToken ct = default)
    {
        var address = await addressAccessor.UpdateAsync(id, request, ct);
        logger.LogInformation("Updated address {AddressId}", address.Id);

        Invalidate(id);

        return ToDto(address);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        await addressAccessor.DeleteAsync(id, ct);
        logger.LogInformation("Deleted address {AddressId}", id);

        Invalidate(id);
    }

    private void Invalidate(Guid id)
    {
        cache.RemoveByPrefix(CacheKeys.AddressBrowsePrefix);
        cache.Remove(CacheKeys.AddressDetail(id));
    }

    private static AddressDto ToDto(Address address)
    {
        return new AddressDto(
            address.Id,
            address.AddressLine1,
            address.AddressLine2,
            address.Suburb,
            address.PostalCode,
            address.ProvinceId,
            new ProvinceDto(address.Province.Id, address.Province.Name));
    }
}
