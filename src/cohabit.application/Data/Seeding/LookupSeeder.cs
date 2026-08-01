using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public abstract class LookupSeeder<TEntity, TEnum> : ILookupSeeder
    where TEntity : class
    where TEnum : struct, Enum
{
    public async Task SeedAsync(CohabitDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var existingNames = (await GetDbSet(dbContext)
                .AsNoTracking()
                .ToListAsync(cancellationToken))
            .Select(GetName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = Enum.GetValues<TEnum>()
            .Where(value => !existingNames.Contains(GetDisplayName(value)))
            .Select(Create);

        GetDbSet(dbContext).AddRange(missing);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    protected abstract DbSet<TEntity> GetDbSet(CohabitDbContext dbContext);

    protected abstract string GetName(TEntity entity);

    protected abstract string GetDisplayName(TEnum value);

    protected abstract TEntity Create(TEnum value);
}
