using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;

namespace cohabit.api.Services;

public sealed class ProvinceService(
    IProvinceAccessor provinceAccessor,
    ICache cache) : IProvinceService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(1);

    public async Task<IReadOnlyList<ProvinceDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await cache.GetOrSetAsync<IReadOnlyList<ProvinceDto>>(CacheKeys.Provinces, async token =>
        {
            var provinces = await provinceAccessor.GetAllAsync(token);
            return provinces
                .Select(p => new ProvinceDto(p.Id, p.Name))
                .ToList();
        }, CacheTtl, ct);
    }
}
