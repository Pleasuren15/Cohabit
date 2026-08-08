using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IListingAccessor
{
    Task<(IReadOnlyList<Listing> Items, int TotalCount)> BrowseAsync(
        ListingQuery query,
        CancellationToken ct = default);

    Task<Listing?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<int> GetPriceAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<Listing>> GetUserListingsAsync(Guid userId, CancellationToken ct = default);

    Task<Listing> UpdateAsync(
        Guid listingId,
        Guid ownerUserId,
        UpdateListingRequest request,
        CancellationToken ct = default);

    Task DeleteAsync(Guid listingId, Guid ownerUserId, CancellationToken ct = default);

    Task<IReadOnlyDictionary<string, string>> FindImageUrlsBySha256Async(
        IReadOnlyCollection<string> sha256Hashes,
        CancellationToken ct = default);

    Task<Listing> CreateAsync(
        CreateListingRequest request,
        IReadOnlyList<ResolvedImage> images,
        CancellationToken ct = default);
}
