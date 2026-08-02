using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class WatchListAccessor(CohabitDbContext dbContext) : IWatchListAccessor
{
    public async Task<WatchList> AddAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        if (await dbContext.Listings.AnyAsync(l => l.Id == listingId, ct) is false)
            throw new NotFoundException("listing_not_found", $"Listing '{listingId}' was not found.");

        if (await dbContext.WatchLists.AnyAsync(w => w.UserId == userId && w.ListingId == listingId, ct))
            throw new ConflictException("already_favorited", $"Listing '{listingId}' is already in the user's favorites.");

        var watchList = WatchList.Create(userId, listingId);
        dbContext.WatchLists.Add(watchList);
        await dbContext.SaveChangesAsync(ct);

        return watchList;
    }

    public async Task<IReadOnlyList<Listing>> GetUserFavoritesAsync(Guid userId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        return await dbContext.WatchLists
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Include(w => w.Listing).ThenInclude(l => l.Address).ThenInclude(a => a.Province)
            .Include(w => w.Listing).ThenInclude(l => l.Type)
            .Include(w => w.Listing).ThenInclude(l => l.User)
            .Include(w => w.Listing).ThenInclude(l => l.Images)
            .OrderByDescending(w => w.Listing.Timestamp)
            .Select(w => w.Listing)
            .ToListAsync(ct);
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        return await dbContext.WatchLists
            .AsNoTracking()
            .AnyAsync(w => w.UserId == userId && w.ListingId == listingId, ct);
    }

    public async Task RemoveAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        var watchList = await dbContext.WatchLists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ListingId == listingId, ct);
        if (watchList is null)
            throw new NotFoundException("favorite_not_found", $"Listing '{listingId}' is not in the user's favorites.");

        dbContext.WatchLists.Remove(watchList);
        await dbContext.SaveChangesAsync(ct);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken ct = default)
    {
        if (await dbContext.Users.AnyAsync(u => u.Id == userId, ct) is false)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");
    }
}
