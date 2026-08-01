using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class ProvinceAccessor(CohabitDbContext dbContext) : IProvinceAccessor
{
    public async Task<IReadOnlyList<Province>> GetAllAsync(CancellationToken ct = default)
    {
        return await dbContext.Provinces
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .ToListAsync(ct);
    }
}
