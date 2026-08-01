using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.application.Domain;

namespace cohabit.api.Services;

public sealed class ListingService(
    IListingAccessor listingAccessor,
    ICache cache,
    ILogger<ListingService> logger) : IListingService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<PagedResult<ListingSummaryDto>> BrowseAsync(ListingQuery query, CancellationToken ct = default)
    {
        query = ValidateQuery(query);
        var key = CacheKeys.ListingBrowse(query);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var (items, totalCount) = await listingAccessor.BrowseAsync(query, token);
            var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);
            return new PagedResult<ListingSummaryDto>(
                items.Select(ToSummary).ToList(),
                query.Page,
                query.PageSize,
                totalCount,
                totalPages);
        }, CacheTtl, ct);
    }

    public async Task<ListingDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var key = CacheKeys.ListingDetail(id);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var listing = await listingAccessor.GetByIdAsync(id, token);
            if (listing is null)
            {
                logger.LogWarning("Listing {ListingId} was not found", id);
                throw new NotFoundException("listing_not_found", $"Listing '{id}' was not found.");
            }

            return ToDetail(listing);
        }, CacheTtl, ct);
    }

    private static ListingQuery ValidateQuery(ListingQuery query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;
        return query with { Page = page, PageSize = pageSize };
    }

    private static ListingSummaryDto ToSummary(Listing listing)
    {
        return new ListingSummaryDto(
            listing.Id,
            listing.Title,
            listing.Description,
            listing.TypeId,
            listing.Type.Name,
            listing.Price,
            listing.Deposit,
            listing.Beds,
            listing.Baths,
            listing.AvailableFrom,
            listing.ResponseTime,
            PrimaryImageUrl(listing),
            ToOwner(listing.User),
            ToAddress(listing.Address));
    }

    private static ListingDetailDto ToDetail(Listing listing)
    {
        return new ListingDetailDto(
            listing.Id,
            listing.Title,
            listing.Description,
            listing.TypeId,
            listing.Type.Name,
            listing.Price,
            listing.Deposit,
            listing.Beds,
            listing.Baths,
            listing.AvailableFrom,
            listing.ResponseTime,
            PrimaryImageUrl(listing),
            ToOwner(listing.User),
            ToAddress(listing.Address),
            listing.Images
                .OrderByDescending(i => i.IsPrimary)
                .Select(i => i.Url)
                .ToList(),
            listing.ListingAmenities
                .Select(la => la.Amenity.Name)
                .ToList(),
            listing.ListingRules
                .Select(lr => lr.Rule.Name)
                .ToList(),
            listing.User.UserVerifications
                .Select(uv => new ListingVerificationDto(
                    uv.VerificationType.Id,
                    uv.VerificationType.Name,
                    uv.IsVerified))
                .ToList());
    }

    private static ListingOwnerDto ToOwner(User user)
    {
        return new ListingOwnerDto(user.Id, user.FirstName, user.LastName, user.AvatarUrl);
    }

    private static ListingAddressDto ToAddress(Address address)
    {
        return new ListingAddressDto(
            address.Suburb,
            address.PostalCode,
            new ProvinceDto(address.Province.Id, address.Province.Name));
    }

    private static string? PrimaryImageUrl(Listing listing)
    {
        return listing.Images
            .OrderByDescending(i => i.IsPrimary)
            .Select(i => i.Url)
            .FirstOrDefault();
    }
}
