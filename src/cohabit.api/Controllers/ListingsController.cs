using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("api/listings")]
public class ListingsController(IListingService listingService) : ControllerBase
{
    /// <summary>
    ///     Browse listings with optional filtering by province, kind (roommate/rentals), search text and pagination.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ListingSummaryDto>>> Browse(
        [FromQuery] int? provinceId,
        [FromQuery] ListingKind? type,
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new ListingQuery(provinceId, type, q, page, pageSize);
        var result = await listingService.BrowseAsync(query, ct);
        return Ok(result);
    }

    /// <summary>
    ///     Get a single listing with its full images, amenities, rules and owner verifications.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ListingDetailDto>> GetById(Guid id, CancellationToken ct = default)
    {
        var listing = await listingService.GetByIdAsync(id, ct);
        return Ok(listing);
    }
}
