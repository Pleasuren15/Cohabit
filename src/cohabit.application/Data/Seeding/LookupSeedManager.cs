namespace cohabit.application.Data.Seeding;

public sealed class LookupSeedManager(IEnumerable<ILookupSeeder> seeders)
{
    public async Task SeedAsync(CohabitDbContext dbContext, CancellationToken cancellationToken = default)
    {
        foreach (var seeder in seeders)
            await seeder.SeedAsync(dbContext, cancellationToken);
    }
}
