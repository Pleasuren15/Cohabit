using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;

namespace cohabit.api.Services;

public sealed class WatchListService(
    IWatchListAccessor watchListAccessor,
    IMessagingAccessor messagingAccessor,
    ICache cache,
    ISystemMessagingService messagingService,
    ILogger<WatchListService> logger) : IWatchListService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<FavoriteDto> AddAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        var watchList = await watchListAccessor.AddAsync(userId, listingId, ct);
        logger.LogInformation("User {UserId} favorited listing {ListingId}", userId, listingId);

        var favoriterName = await messagingAccessor.GetUserDisplayNameAsync(userId, ct);
        var listingTitle = await messagingAccessor.GetListingTitleAsync(listingId, ct);

        await messagingService.SendToListingOwnerAsync(
            listingId,
            "Listing Liked",
            $"{favoriterName} saved \"{listingTitle}\" to their watchlist.");
        await messagingService.SendAsync(
            userId,
            "Added to WatchList",
            $"You saved \"{listingTitle}\" to your watchlist.",
            listingId);

        cache.Remove(CacheKeys.UserFavorites(userId));

        return new FavoriteDto(watchList.UserId, watchList.ListingId);
    }

    public async Task<IReadOnlyList<ListingSummaryDto>> GetUserFavoritesAsync(Guid userId, CancellationToken ct = default)
    {
        var key = CacheKeys.UserFavorites(userId);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var listings = await watchListAccessor.GetUserFavoritesAsync(userId, token);
            return listings.Select(ListingMapper.ToSummary).ToList();
        }, CacheTtl, ct);
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        return await watchListAccessor.IsFavoriteAsync(userId, listingId, ct);
    }

    public async Task RemoveAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await watchListAccessor.RemoveAsync(userId, listingId, ct);
        logger.LogInformation("User {UserId} removed favorite listing {ListingId}", userId, listingId);

        cache.Remove(CacheKeys.UserFavorites(userId));
    }
}
