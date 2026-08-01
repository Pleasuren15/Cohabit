namespace cohabit.application.Data.Seeding;

public interface ILookupSeeder
{
    Task SeedAsync(CohabitDbContext dbContext, CancellationToken cancellationToken = default);
}
