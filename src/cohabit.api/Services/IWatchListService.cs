using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IWatchListService
{
    Task<FavoriteDto> AddAsync(Guid userId, Guid listingId, CancellationToken ct = default);

    Task<IReadOnlyList<ListingSummaryDto>> GetUserFavoritesAsync(Guid userId, CancellationToken ct = default);

    Task<bool> IsFavoriteAsync(Guid userId, Guid listingId, CancellationToken ct = default);

    Task RemoveAsync(Guid userId, Guid listingId, CancellationToken ct = default);
}
