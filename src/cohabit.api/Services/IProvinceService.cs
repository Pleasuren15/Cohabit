using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IProvinceService
{
    Task<IReadOnlyList<ProvinceDto>> GetAllAsync(CancellationToken ct = default);
}
