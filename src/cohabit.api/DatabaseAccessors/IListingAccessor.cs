using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IListingAccessor
{
    Task<(IReadOnlyList<Listing> Items, int TotalCount)> BrowseAsync(
        ListingQuery query,
        CancellationToken ct = default);

    Task<Listing?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
