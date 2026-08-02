using cohabit.api.DatabaseAccessors;
using cohabit.application.Domain;

namespace cohabit.api.unit.tests;

internal sealed class CountingWatchListAccessor(IWatchListAccessor inner) : IWatchListAccessor
{
    public int AddCalls { get; private set; }

    public int GetUserFavoritesCalls { get; private set; }

    public int IsFavoriteCalls { get; private set; }

    public int RemoveCalls { get; private set; }

    public async Task<WatchList> AddAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        AddCalls++;
        return await inner.AddAsync(userId, listingId, ct);
    }

    public async Task<IReadOnlyList<Listing>> GetUserFavoritesAsync(Guid userId, CancellationToken ct = default)
    {
        GetUserFavoritesCalls++;
        return await inner.GetUserFavoritesAsync(userId, ct);
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        IsFavoriteCalls++;
        return await inner.IsFavoriteAsync(userId, listingId, ct);
    }

    public async Task RemoveAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        RemoveCalls++;
        await inner.RemoveAsync(userId, listingId, ct);
    }
}
