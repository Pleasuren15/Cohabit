using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IWatchListAccessor
{
    Task<WatchList> AddAsync(Guid userId, Guid listingId, CancellationToken ct = default);

    Task<IReadOnlyList<Listing>> GetUserFavoritesAsync(Guid userId, CancellationToken ct = default);

    Task<bool> IsFavoriteAsync(Guid userId, Guid listingId, CancellationToken ct = default);

    Task RemoveAsync(Guid userId, Guid listingId, CancellationToken ct = default);
}
