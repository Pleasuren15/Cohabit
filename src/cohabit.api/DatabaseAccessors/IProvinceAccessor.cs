using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IProvinceAccessor
{
    Task<IReadOnlyList<Province>> GetAllAsync(CancellationToken ct = default);
}
