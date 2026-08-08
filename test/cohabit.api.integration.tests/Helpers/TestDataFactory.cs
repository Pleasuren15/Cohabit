using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.integration.tests.Helpers;

public sealed class TestDataFactory : IDisposable
{
    private readonly CohabitDbContext _db;

    public TestDataFactory(CohabitDbContext db)
    {
        _db = db;
    }

    public Task<Province> ProvinceByNameAsync(string name) =>
        _db.Provinces.SingleAsync(p => p.Name == name);

    public Task<ListingType> ListingTypeByNameAsync(string name) =>
        _db.ListingTypes.SingleAsync(t => t.Name == name);

    public async Task<Address> CreateAddressAsync(
        string addressLine1 = "1 Main Rd",
        string addressLine2 = "",
        string suburb = "Sea Point",
        string postalCode = "8005",
        string provinceName = "Western Cape")
    {
        var province = await ProvinceByNameAsync(provinceName);
        var address = Address.Create(addressLine1, addressLine2, suburb, postalCode, province.Id);
        _db.Addresses.Add(address);
        await _db.SaveChangesAsync();
        return address;
    }

    public async Task<User> CreateUserAsync(
        string firstName = "Alice",
        string lastName = "Smith",
        string email = "alice@example.com",
        string cellphone = "0812345678",
        char gender = 'F',
        Guid? addressId = null)
    {
        var addressIdValue = addressId ?? (await CreateAddressAsync()).Id;
        var user = User.Create(
            firstName,
            lastName,
            cellphone,
            email,
            DateOnly.Parse("1995-01-01"),
            gender,
            null,
            addressIdValue);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<Listing> CreateListingAsync(
        User owner,
        string title = "Sunny room in Sea Point",
        string listingTypeName = "Room",
        string suburb = "Sea Point",
        string provinceName = "Western Cape",
        int price = 7500,
        int deposit = 7500,
        DateTime? expires = null,
        Guid? addressId = null)
    {
        var addressIdValue = addressId ?? (await CreateAddressAsync(suburb: suburb, provinceName: provinceName)).Id;
        var type = await ListingTypeByNameAsync(listingTypeName);
        var listing = Listing.Create(
            owner.Id,
            addressIdValue,
            title,
            "Bright room with sea views",
            type.Id,
            price,
            deposit,
            1,
            1,
            DateOnly.Parse("2026-09-01"),
            "Within the hour",
            expires ?? DateTime.UtcNow.AddDays(30));
        _db.Listings.Add(listing);
        await _db.SaveChangesAsync();
        return listing;
    }

    public void Dispose() => _db.Dispose();
}
