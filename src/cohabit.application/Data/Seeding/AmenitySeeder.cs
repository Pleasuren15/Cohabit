using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class AmenitySeeder : LookupSeeder<Amenity, AmenityName>
{
    protected override DbSet<Amenity> GetDbSet(CohabitDbContext dbContext) => dbContext.Amenities;

    protected override string GetName(Amenity entity) => entity.Name;

    protected override string GetDisplayName(AmenityName value) => value.GetDescription();

    protected override Amenity Create(AmenityName value) => Amenity.Create(value.GetDescription());
}
