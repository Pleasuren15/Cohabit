using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.unit.tests;

public sealed class TestData
{
    public Province WesternCape { get; private set; } = null!;
    public Province Gauteng { get; private set; } = null!;
    public ListingType Room { get; private set; } = null!;
    public ListingType Apartment { get; private set; } = null!;
    public User Alice { get; private set; } = null!;
    public User Bob { get; private set; } = null!;
    public Amenity Wifi { get; private set; } = null!;
    public Rule NoSmoking { get; private set; } = null!;
    public Address WcAddress { get; private set; } = null!;
    public Address GpAddress { get; private set; } = null!;
    public Listing RoomListing { get; private set; } = null!;
    public Listing ApartmentListing { get; private set; } = null!;
    public Listing ExpiredListing { get; private set; } = null!;

    public static CohabitDbContext CreateDbContext() =>
        new(new DbContextOptionsBuilder<CohabitDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    public async Task SeedAsync(CohabitDbContext db)
    {
        WesternCape = Province.Create("Western Cape");
        Gauteng = Province.Create("Gauteng");
        db.Provinces.AddRange(WesternCape, Gauteng);
        await db.SaveChangesAsync();

        Room = ListingType.Create("Room");
        Apartment = ListingType.Create("Apartment");
        db.ListingTypes.AddRange(Room, Apartment);
        await db.SaveChangesAsync();

        var alice = User.CreateFromJwt("Alice", "Smith", DateOnly.Parse("1995-01-01"), 'F');
        var bob = User.CreateFromJwt("Bob", "Jones", DateOnly.Parse("1992-05-05"), 'M');
        Alice = alice;
        Bob = bob;
        db.Users.AddRange(alice, bob);
        await db.SaveChangesAsync();

        Wifi = Amenity.Create("Wi-Fi");
        NoSmoking = Rule.Create("No smoking");
        db.Amenities.Add(Wifi);
        db.Rules.Add(NoSmoking);
        await db.SaveChangesAsync();

        var wcAddress = Address.Create("1 Main Rd", "", "Sea Point", "8005", WesternCape.Id);
        var gpAddress = Address.Create("2 Fox St", "", "Sandton", "2001", Gauteng.Id);
        WcAddress = wcAddress;
        GpAddress = gpAddress;
        db.Addresses.AddRange(wcAddress, gpAddress);
        await db.SaveChangesAsync();

        RoomListing = Listing.Create(
            alice.Id, wcAddress.Id, "Sunny room in Sea Point", "Bright room with sea views",
            Room.Id, 7500, 7500, 1, 1, DateOnly.Parse("2026-09-01"), "Within the hour",
            DateTime.UtcNow.AddDays(30));
        db.Listings.Add(RoomListing);
        await db.SaveChangesAsync();
        await Task.Delay(5);

        ApartmentListing = Listing.Create(
            bob.Id, gpAddress.Id, "Modern Sandton apartment", "2 bed apartment near the mall",
            Apartment.Id, 15000, 15000, 2, 2, DateOnly.Parse("2026-08-01"), "Within a day",
            DateTime.UtcNow.AddDays(30));
        db.Listings.Add(ApartmentListing);
        await db.SaveChangesAsync();
        await Task.Delay(5);

        ExpiredListing = Listing.Create(
            alice.Id, wcAddress.Id, "Expired room", "This should not be listed",
            Room.Id, 5000, 5000, 1, 1, DateOnly.Parse("2026-07-01"), "Within the hour",
            DateTime.UtcNow.AddDays(-1));
        db.Listings.Add(ExpiredListing);
        await db.SaveChangesAsync();

        var primaryImage = Image.Create(RoomListing.Id, "https://example.com/room.jpg", true);
        db.Images.Add(primaryImage);
        await db.SaveChangesAsync();
    }
}
