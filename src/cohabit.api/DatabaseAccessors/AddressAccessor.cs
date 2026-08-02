using cohabit.api.Contracts;
using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class AddressAccessor(CohabitDbContext dbContext) : IAddressAccessor
{
    public async Task<IReadOnlyList<Address>> SearchAsync(AddressQuery query, CancellationToken ct = default)
    {
        var search = string.IsNullOrWhiteSpace(query.Q) ? null : query.Q.Trim().ToLower();

        IQueryable<Address> baseQuery = dbContext.Addresses.AsNoTracking().Include(a => a.Province);

        if (query.ProvinceId is not null)
            baseQuery = baseQuery.Where(a => a.ProvinceId == query.ProvinceId);

        if (search is not null)
        {
            baseQuery = baseQuery.Where(a =>
                a.AddressLine1.ToLower().Contains(search)
                || a.Suburb.ToLower().Contains(search)
                || a.PostalCode.ToLower().Contains(search));
        }

        return await baseQuery
            .OrderBy(a => a.Suburb)
            .ThenBy(a => a.PostalCode)
            .ToListAsync(ct);
    }

    public async Task<Address?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await dbContext.Addresses
            .AsNoTracking()
            .Include(a => a.Province)
            .FirstOrDefaultAsync(a => a.Id == id, ct);
    }

    public async Task<Address> CreateAsync(CreateAddressRequest request, CancellationToken ct = default)
    {
        await EnsureProvinceExistsAsync(request.ProvinceId, ct);

        var address = Address.Create(
            request.AddressLine1.Trim(),
            request.AddressLine2.Trim(),
            request.Suburb.Trim(),
            request.PostalCode.Trim(),
            request.ProvinceId);

        dbContext.Addresses.Add(address);
        await dbContext.SaveChangesAsync(ct);

        return (await GetByIdAsync(address.Id, ct))!;
    }

    public async Task<Address> UpdateAsync(Guid id, UpdateAddressRequest request, CancellationToken ct = default)
    {
        var address = await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (address is null)
            throw new NotFoundException("address_not_found", $"Address '{id}' was not found.");

        await EnsureProvinceExistsAsync(request.ProvinceId, ct);

        address.Update(
            request.AddressLine1.Trim(),
            request.AddressLine2.Trim(),
            request.Suburb.Trim(),
            request.PostalCode.Trim(),
            request.ProvinceId);

        await dbContext.SaveChangesAsync(ct);

        return (await GetByIdAsync(id, ct))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var address = await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (address is null)
            throw new NotFoundException("address_not_found", $"Address '{id}' was not found.");

        var isReferenced = await dbContext.Listings.AnyAsync(l => l.AddressId == id, ct)
            || await dbContext.Users.AnyAsync(u => u.AddressId == id, ct);
        if (isReferenced)
            throw new ConflictException("address_in_use", $"Address '{id}' is referenced by a user or listing.");

        dbContext.Addresses.Remove(address);
        await dbContext.SaveChangesAsync(ct);
    }

    private async Task EnsureProvinceExistsAsync(int provinceId, CancellationToken ct = default)
    {
        if (await dbContext.Provinces.FirstOrDefaultAsync(p => p.Id == provinceId, ct) is null)
            throw new ValidationException("province_not_found", $"Province '{provinceId}' was not found.");
    }
}
