using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.application.Domain;

namespace cohabit.api.unit.tests;

internal sealed class CountingListingAccessor(IListingAccessor inner) : IListingAccessor
{
    public int BrowseCalls { get; private set; }

    public int DetailCalls { get; private set; }

    public int UserListingsCalls { get; private set; }

    public int UpdateCalls { get; private set; }

    public int DeleteCalls { get; private set; }

    public async Task<(IReadOnlyList<Listing> Items, int TotalCount)> BrowseAsync(ListingQuery query, CancellationToken ct = default)
    {
        BrowseCalls++;
        return await inner.BrowseAsync(query, ct);
    }

    public async Task<Listing?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        DetailCalls++;
        return await inner.GetByIdAsync(id, ct);
    }

    public async Task<IReadOnlyList<Listing>> GetUserListingsAsync(Guid userId, CancellationToken ct = default)
    {
        UserListingsCalls++;
        return await inner.GetUserListingsAsync(userId, ct);
    }

    public async Task<Listing> UpdateAsync(
        Guid listingId,
        Guid ownerUserId,
        UpdateListingRequest request,
        CancellationToken ct = default)
    {
        UpdateCalls++;
        return await inner.UpdateAsync(listingId, ownerUserId, request, ct);
    }

    public async Task DeleteAsync(Guid listingId, Guid ownerUserId, CancellationToken ct = default)
    {
        DeleteCalls++;
        await inner.DeleteAsync(listingId, ownerUserId, ct);
    }

    public Task<IReadOnlyDictionary<string, string>> FindImageUrlsBySha256Async(
        IReadOnlyCollection<string> sha256Hashes,
        CancellationToken ct = default)
    {
        return inner.FindImageUrlsBySha256Async(sha256Hashes, ct);
    }

    public Task<Listing> CreateAsync(
        CreateListingRequest request,
        IReadOnlyList<ResolvedImage> images,
        CancellationToken ct = default)
    {
        return inner.CreateAsync(request, images, ct);
    }
}
