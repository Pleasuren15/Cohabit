using cohabit.api.Contracts;
using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class ListingAccessor(CohabitDbContext dbContext) : IListingAccessor
{
    public async Task<(IReadOnlyList<Listing> Items, int TotalCount)> BrowseAsync(
        ListingQuery query,
        CancellationToken ct = default)
    {
        var search = string.IsNullOrWhiteSpace(query.Q) ? null : query.Q.Trim().ToLower();

        var baseQuery = dbContext.Listings
            .AsNoTracking()
            .Include(l => l.Address).ThenInclude(a => a.Province)
            .Include(l => l.Type)
            .Include(l => l.User)
            .Include(l => l.Images)
            .Where(l => l.Expires >= DateTime.UtcNow);

        if (query.ProvinceId is not null)
            baseQuery = baseQuery.Where(l => l.Address.ProvinceId == query.ProvinceId);

        if (query.Type is not null)
        {
            var roommateTypeName = ListingTypeName.Room.GetDescription();
            baseQuery = query.Type == ListingKind.Roommate
                ? baseQuery.Where(l => l.Type.Name == roommateTypeName)
                : baseQuery.Where(l => l.Type.Name != roommateTypeName);
        }

        if (search is not null)
        {
            baseQuery = baseQuery.Where(l =>
                l.Title.ToLower().Contains(search)
                || l.Description.ToLower().Contains(search)
                || l.Address.Suburb.ToLower().Contains(search)
                || (l.User.FirstName + " " + l.User.LastName).ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .OrderByDescending(l => l.Timestamp)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<Listing?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await dbContext.Listings
            .AsNoTracking()
            .Include(l => l.Address).ThenInclude(a => a.Province)
            .Include(l => l.Type)
            .Include(l => l.User).ThenInclude(u => u.UserVerifications).ThenInclude(uv => uv.VerificationType)
            .Include(l => l.Images)
            .Include(l => l.ListingAmenities).ThenInclude(la => la.Amenity)
            .Include(l => l.ListingRules).ThenInclude(lr => lr.Rule)
            .FirstOrDefaultAsync(l => l.Id == id, ct);
    }

    public async Task<IReadOnlyList<Listing>> GetUserListingsAsync(Guid userId, CancellationToken ct = default)
    {
        var userExists = await dbContext.Users.AnyAsync(u => u.Id == userId, ct);
        if (!userExists)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");

        return await dbContext.Listings
            .AsNoTracking()
            .Include(l => l.Address).ThenInclude(a => a.Province)
            .Include(l => l.Type)
            .Include(l => l.User)
            .Include(l => l.Images)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync(ct);
    }

    public async Task<Listing> UpdateAsync(
        Guid listingId,
        Guid ownerUserId,
        UpdateListingRequest request,
        CancellationToken ct = default)
    {
        var listing = await dbContext.Listings
            .Include(l => l.Address)
            .FirstOrDefaultAsync(l => l.Id == listingId && l.UserId == ownerUserId, ct);
        if (listing is null)
            throw new NotFoundException("listing_not_found", $"Listing '{listingId}' was not found.");

        if (await dbContext.Provinces.FirstOrDefaultAsync(p => p.Id == request.ProvinceId, ct) is null)
            throw new ValidationException("province_not_found", $"Province '{request.ProvinceId}' was not found.");

        if (await dbContext.ListingTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId, ct) is null)
            throw new ValidationException("listing_type_not_found", $"Listing type '{request.TypeId}' was not found.");

        var amenityIds = request.AmenityIds ?? [];
        var ruleIds = request.RuleIds ?? [];

        if (amenityIds.Count > 0)
        {
            var found = await dbContext.Amenities.CountAsync(a => amenityIds.Contains(a.Id), ct);
            if (found != amenityIds.Count)
                throw new ValidationException("amenity_not_found", "One or more amenities were not found.");
        }

        if (ruleIds.Count > 0)
        {
            var found = await dbContext.Rules.CountAsync(r => ruleIds.Contains(r.Id), ct);
            if (found != ruleIds.Count)
                throw new ValidationException("rule_not_found", "One or more rules were not found.");
        }

        listing.Update(
            request.Title,
            request.Description,
            request.TypeId,
            request.Price,
            request.Deposit,
            request.Beds,
            request.Baths,
            request.AvailableFrom,
            request.ResponseTime);

        listing.Address.Update(
            request.AddressLine1,
            request.AddressLine2 ?? string.Empty,
            request.Suburb,
            request.PostalCode,
            request.ProvinceId);

        dbContext.ListingAmenities.RemoveRange(
            await dbContext.ListingAmenities.Where(la => la.ListingId == listingId).ToListAsync(ct));
        dbContext.ListingRules.RemoveRange(
            await dbContext.ListingRules.Where(lr => lr.ListingId == listingId).ToListAsync(ct));

        foreach (var amenityId in amenityIds)
            dbContext.ListingAmenities.Add(ListingAmenity.Create(listingId, amenityId));

        foreach (var ruleId in ruleIds)
            dbContext.ListingRules.Add(ListingRule.Create(listingId, ruleId));

        await dbContext.SaveChangesAsync(ct);

        return (await GetByIdAsync(listingId, ct))!;
    }

    public async Task DeleteAsync(Guid listingId, Guid ownerUserId, CancellationToken ct = default)
    {
        var listing = await dbContext.Listings
            .Include(l => l.Images)
            .Include(l => l.ListingAmenities)
            .Include(l => l.ListingRules)
            .Include(l => l.WatchLists)
            .FirstOrDefaultAsync(l => l.Id == listingId && l.UserId == ownerUserId, ct);
        if (listing is null)
            throw new NotFoundException("listing_not_found", $"Listing '{listingId}' was not found.");

        dbContext.Listings.Remove(listing);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyDictionary<string, string>> FindImageUrlsBySha256Async(
        IReadOnlyCollection<string> sha256Hashes,
        CancellationToken ct = default)
    {
        if (sha256Hashes.Count == 0)
            return new Dictionary<string, string>();

        var rows = await dbContext.Images
            .AsNoTracking()
            .Where(i => i.Sha256 != null && sha256Hashes.Contains(i.Sha256))
            .Select(i => new { i.Sha256, i.Url })
            .ToListAsync(ct);

        return rows
            .GroupBy(r => r.Sha256!)
            .ToDictionary(g => g.Key, g => g.First().Url);
    }

    public async Task<Listing> CreateAsync(
        CreateListingRequest request,
        IReadOnlyList<ResolvedImage> images,
        CancellationToken ct = default)
    {
        var userExists = await dbContext.Users.AnyAsync(u => u.Id == request.UserId, ct);
        if (!userExists)
            throw new NotFoundException("user_not_found", $"User '{request.UserId}' was not found.");

        if (await dbContext.Provinces.FirstOrDefaultAsync(p => p.Id == request.ProvinceId, ct) is null)
            throw new ValidationException("province_not_found", $"Province '{request.ProvinceId}' was not found.");

        if (await dbContext.ListingTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId, ct) is null)
            throw new ValidationException("listing_type_not_found", $"Listing type '{request.TypeId}' was not found.");

        var amenityIds = request.AmenityIds ?? [];
        var ruleIds = request.RuleIds ?? [];

        if (amenityIds.Count > 0)
        {
            var found = await dbContext.Amenities.CountAsync(a => amenityIds.Contains(a.Id), ct);
            if (found != amenityIds.Count)
                throw new ValidationException("amenity_not_found", "One or more amenities were not found.");
        }

        if (ruleIds.Count > 0)
        {
            var found = await dbContext.Rules.CountAsync(r => ruleIds.Contains(r.Id), ct);
            if (found != ruleIds.Count)
                throw new ValidationException("rule_not_found", "One or more rules were not found.");
        }

        var address = Address.Create(
            request.AddressLine1,
            request.AddressLine2 ?? string.Empty,
            request.Suburb,
            request.PostalCode,
            request.ProvinceId);

        var listing = Listing.Create(
            request.UserId,
            address.Id,
            request.Title,
            request.Description,
            request.TypeId,
            request.Price,
            request.Deposit,
            request.Beds,
            request.Baths,
            request.AvailableFrom,
            request.ResponseTime,
            DateTime.UtcNow.AddDays(30));

        dbContext.Addresses.Add(address);
        dbContext.Listings.Add(listing);

        foreach (var image in images)
            dbContext.Images.Add(Image.Create(listing.Id, image.Url, image.IsPrimary, image.Sha256));

        foreach (var amenityId in amenityIds)
            dbContext.ListingAmenities.Add(ListingAmenity.Create(listing.Id, amenityId));

        foreach (var ruleId in ruleIds)
            dbContext.ListingRules.Add(ListingRule.Create(listing.Id, ruleId));

        await dbContext.SaveChangesAsync(ct);

        return (await GetByIdAsync(listing.Id, ct))!;
    }
}
