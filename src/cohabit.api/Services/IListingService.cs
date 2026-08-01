using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IListingService
{
    Task<PagedResult<ListingSummaryDto>> BrowseAsync(ListingQuery query, CancellationToken ct = default);

    Task<ListingDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default);
}
