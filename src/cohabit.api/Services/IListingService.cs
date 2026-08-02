using cohabit.api.Contracts;
using Microsoft.AspNetCore.Http;

namespace cohabit.api.Services;

public interface IListingService
{
    Task<PagedResult<ListingSummaryDto>> BrowseAsync(ListingQuery query, CancellationToken ct = default);

    Task<ListingDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<ListingSummaryDto>> GetUserListingsAsync(Guid userId, CancellationToken ct = default);

    Task<ListingDetailDto> UpdateAsync(
        Guid userId,
        Guid listingId,
        UpdateListingRequest request,
        CancellationToken ct = default);

    Task DeleteAsync(Guid userId, Guid listingId, CancellationToken ct = default);

    Task<ListingDetailDto> CreateAsync(
        CreateListingRequest request,
        IReadOnlyList<IFormFile> images,
        CancellationToken ct = default);
}
