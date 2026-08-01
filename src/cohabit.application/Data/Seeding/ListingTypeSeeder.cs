using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class ListingTypeSeeder : LookupSeeder<ListingType, ListingTypeName>
{
    protected override DbSet<ListingType> GetDbSet(CohabitDbContext dbContext) => dbContext.ListingTypes;

    protected override string GetName(ListingType entity) => entity.Name;

    protected override string GetDisplayName(ListingTypeName value) => value.GetDescription();

    protected override ListingType Create(ListingTypeName value) => ListingType.Create(value.GetDescription());
}
