using System.Security.Cryptography;
using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.application.Domain;
using Microsoft.AspNetCore.Http;

namespace cohabit.api.Services;

public sealed class ListingService(
    IListingAccessor listingAccessor,
    ICache cache,
    IImageStorage imageStorage,
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

    public async Task<IReadOnlyList<ListingSummaryDto>> GetUserListingsAsync(Guid userId, CancellationToken ct = default)
    {
        var key = CacheKeys.UserListings(userId);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var listings = await listingAccessor.GetUserListingsAsync(userId, token);
            return listings.Select(ToSummary).ToList();
        }, CacheTtl, ct);
    }

    public async Task<ListingDetailDto> UpdateAsync(
        Guid userId,
        Guid listingId,
        UpdateListingRequest request,
        CancellationToken ct = default)
    {
        var listing = await listingAccessor.UpdateAsync(listingId, userId, request, ct);
        logger.LogInformation("Updated listing {ListingId} for user {UserId}", listing.Id, userId);

        InvalidateListingCaches(userId, listingId);

        return ToDetail(listing);
    }

    public async Task DeleteAsync(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await listingAccessor.DeleteAsync(listingId, userId, ct);
        logger.LogInformation("Deleted listing {ListingId} for user {UserId}", listingId, userId);

        InvalidateListingCaches(userId, listingId);
    }

    public async Task<ListingDetailDto> CreateAsync(
        CreateListingRequest request,
        IReadOnlyList<IFormFile> images,
        CancellationToken ct = default)
    {
        var inputs = await Task.WhenAll(images.Select(file => ReadImageAsync(file, ct)));
        var hashes = inputs.Select(i => i.Sha256).Distinct().ToList();

        var resolvedUrls = new Dictionary<string, string>(await listingAccessor.FindImageUrlsBySha256Async(hashes, ct));

        var resolved = new List<ResolvedImage>();
        var primaryIndex = request.PrimaryImageIndex ?? 0;

        for (var index = 0; index < inputs.Length; index++)
        {
            var input = inputs[index];

            if (resolvedUrls.TryGetValue(input.Sha256, out var url))
            {
                logger.LogInformation("Reusing existing image {Sha256} at {Url}", input.Sha256, url);
                resolved.Add(new ResolvedImage(url, input.Sha256, index == primaryIndex));
                continue;
            }

            url = await imageStorage.UploadAsync(input.FileName, input.Content, input.ContentType, ct);
            resolvedUrls[input.Sha256] = url;
            resolved.Add(new ResolvedImage(url, input.Sha256, index == primaryIndex));
        }

        var listing = await listingAccessor.CreateAsync(request, resolved, ct);
        logger.LogInformation("Created listing {ListingId} for user {UserId}", listing.Id, listing.UserId);

        cache.RemoveByPrefix(CacheKeys.ListingBrowsePrefix);
        cache.Remove(CacheKeys.UserListings(listing.UserId));

        return ToDetail(listing);
    }

    private void InvalidateListingCaches(Guid userId, Guid listingId)
    {
        cache.RemoveByPrefix(CacheKeys.ListingBrowsePrefix);
        cache.Remove(CacheKeys.UserListings(userId));
        cache.Remove(CacheKeys.ListingDetail(listingId));
    }

    private static async Task<ImageInput> ReadImageAsync(IFormFile file, CancellationToken ct = default)
    {
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        var content = stream.ToArray();
        return new ImageInput(
            file.FileName,
            file.ContentType,
            content,
            Convert.ToHexString(SHA256.HashData(content)).ToLowerInvariant());
    }

    private sealed record ImageInput(string FileName, string ContentType, byte[] Content, string Sha256);

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
