using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class ProvinceSeeder : LookupSeeder<Province, ProvinceName>
{
    protected override DbSet<Province> GetDbSet(CohabitDbContext dbContext) => dbContext.Provinces;

    protected override string GetName(Province entity) => entity.Name;

    protected override string GetDisplayName(ProvinceName value) => value.GetDescription();

    protected override Province Create(ProvinceName value) => Province.Create(value.GetDescription());
}
