using cohabit.api.Contracts;
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
}
