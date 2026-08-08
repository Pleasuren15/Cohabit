using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class DemoDataSeeder : ILookupSeeder
{
    /// <summary>The fixed account the web app signs in as in real-API mode.</summary>
    public static readonly Guid DemoUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public async Task SeedAsync(CohabitDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await EnsureDemoUserAsync(dbContext, cancellationToken);

        if (await dbContext.Listings.AnyAsync(cancellationToken))
            return;

        var provinceIds = await dbContext.Provinces
            .ToDictionaryAsync(p => p.Name, p => p.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var listingTypeIds = await dbContext.ListingTypes
            .ToDictionaryAsync(t => t.Name, t => t.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var amenityIds = await dbContext.Amenities
            .ToDictionaryAsync(a => a.Name, a => a.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var ruleIds = await dbContext.Rules
            .ToDictionaryAsync(r => r.Name, r => r.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);

        foreach (var demo in DemoListings)
        {
            var address = Address.Create(
                demo.AddressLine1,
                demo.AddressLine2,
                demo.Suburb,
                demo.PostalCode,
                provinceIds[demo.Province]);
            dbContext.Addresses.Add(address);

            var user = User.Create(
                demo.OwnerFirstName,
                demo.OwnerLastName,
                demo.OwnerCellphone,
                demo.OwnerEmail,
                demo.OwnerDateOfBirth,
                demo.OwnerGender,
                demo.OwnerBio,
                address.Id);
            dbContext.Users.Add(user);

            var listing = Listing.Create(
                user.Id,
                address.Id,
                demo.Title,
                demo.Description,
                listingTypeIds[demo.Type],
                demo.Price,
                demo.Deposit,
                demo.Beds,
                demo.Baths,
                demo.AvailableFrom,
                demo.ResponseTime,
                DateTime.UtcNow.AddDays(30));
            dbContext.Listings.Add(listing);

            foreach (var (url, isPrimary) in demo.Images)
                dbContext.Images.Add(Image.Create(listing.Id, url, isPrimary));

            foreach (var amenity in demo.Amenities)
                dbContext.ListingAmenities.Add(ListingAmenity.Create(listing.Id, amenityIds[amenity]));

            foreach (var rule in demo.Rules)
                dbContext.ListingRules.Add(ListingRule.Create(listing.Id, ruleIds[rule]));
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureDemoUserAsync(CohabitDbContext dbContext, CancellationToken cancellationToken)
    {
        if (await dbContext.Users.AnyAsync(u => u.Id == DemoUserId, cancellationToken))
            return;

        var provinceId = (await dbContext.Provinces
                .FirstOrDefaultAsync(p => p.Name == "Gauteng", cancellationToken))
            ?.Id ?? 1;

        var address = Address.Create(
            "42 Demo Lane",
            "",
            "Rosebank",
            "2196",
            provinceId);
        dbContext.Addresses.Add(address);

        var user = User.Create(
            "Thabo",
            "Mokoena",
            "+27 82 123 4567",
            "thabo.demo@example.com",
            new DateOnly(1994, 5, 12),
            'M',
            "Creative graphic designer looking for a shared space.",
            address.Id,
            DemoUserId);
        dbContext.Users.Add(user);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private sealed record DemoListing(
        string Title,
        string Description,
        string Province,
        string AddressLine1,
        string AddressLine2,
        string Suburb,
        string PostalCode,
        string Type,
        int Price,
        int Deposit,
        int Beds,
        int Baths,
        DateOnly AvailableFrom,
        string ResponseTime,
        string OwnerFirstName,
        string OwnerLastName,
        string OwnerCellphone,
        string OwnerEmail,
        DateOnly OwnerDateOfBirth,
        char OwnerGender,
        string OwnerBio,
        string OwnerAvatar,
        (string Url, bool IsPrimary)[] Images,
        string[] Amenities,
        string[] Rules);

    private static readonly DemoListing[] DemoListings =
    [
        new(
            "Bright furnished room in Green Point",
            "Sunny furnished room in a shared 3-bed apartment, 5 minutes from the Sea Point promenade. Great flatmates and a fully stocked kitchen.",
            "Western Cape",
            "12 Beach Road",
            "Flat 3",
            "Green Point",
            "8005",
            "Room",
            6500,
            6500,
            1,
            1,
            new DateOnly(2026, 9, 1),
            "within 1 hour",
            "Thandi",
            "Mokoena",
            "+27 71 234 5678",
            "thandi.mokoena@example.com",
            new DateOnly(1993, 5, 12),
            'F',
            "Digital marketer who loves running along the promenade and hosting braais on weekends.",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["High Speed WiFi", "Furnished", "Security"],
            ["No Smoking", "Quiet Hours", "No Parties"]),

        new(
            "Modern 2-bed apartment near Rosebank Mall",
            "Contemporary 2-bedroom, 2-bathroom apartment with open-plan living, fibre and a balcony overlooking Rosebank. Secure complex with gym and pool.",
            "Gauteng",
            "34 Cradock Avenue",
            "Unit 8",
            "Rosebank",
            "2196",
            "Apartment",
            14500,
            14500,
            2,
            2,
            new DateOnly(2026, 8, 15),
            "within 24 hours",
            "Liam",
            "van der Merwe",
            "+27 82 345 6789",
            "liam.vdmerwe@example.com",
            new DateOnly(1990, 11, 3),
            'M',
            "Software developer, keen cyclist and amateur coffee roaster.",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000&h=700", false),
                ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["High Speed WiFi", "Swimming Pool", "Gym", "Balcony", "Parking", "Air Conditioning"],
            ["No Smoking", "No Parties", "Quiet Hours"]),

        new(
            "Cozy studio with garden access",
            "Self-contained studio cottage with private entrance and garden access, two minutes from Umhlanga beaches and the promenade.",
            "KwaZulu-Natal",
            "9 Lagoon Drive",
            "Studio Cottage",
            "Umhlanga",
            "4319",
            "Studio",
            8500,
            8500,
            1,
            1,
            new DateOnly(2026, 9, 1),
            "within a day",
            "Aisha",
            "Patel",
            "+27 73 456 7890",
            "aisha.patel@example.com",
            new DateOnly(1996, 2, 20),
            'F',
            "Interior designer who loves the beach, good food and quiet Sunday mornings.",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000&h=700", true),
            ],
            ["High Speed WiFi", "Furnished", "Pet Friendly", "Laundry"],
            ["No Smoking", "No Parties"]),

        new(
            "Family home in Waterkloof Ridge",
            "Spacious 4-bedroom family home on a quiet street, with a large garden, solar power and staff quarters. Ideal for a long-term lease.",
            "Gauteng",
            "18 Cedar Road",
            "",
            "Waterkloof Ridge",
            "0181",
            "House",
            22000,
            44000,
            4,
            3,
            new DateOnly(2026, 10, 1),
            "within 48 hours",
            "Emma",
            "de Villiers",
            "+27 84 567 8901",
            "emma.devilliers@example.com",
            new DateOnly(1988, 7, 15),
            'F',
            "Architect and mother of two, looking for reliable long-term tenants.",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1000&h=700", false),
                ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["Parking", "Security", "Solar Power", "Gym", "Cleaning Service"],
            ["No Smoking", "No Pets", "Quiet Hours"]),

        new(
            "Shared townhouse, single room available",
            "Single room in a modern 3-bed townhouse in a gated estate. Shared bathroom, fibre internet and braai area. Great for young professionals.",
            "Gauteng",
            "77 West Street",
            "Unit 12",
            "Sandton",
            "2196",
            "Townhouse",
            7200,
            7200,
            1,
            2,
            new DateOnly(2026, 8, 20),
            "within a day",
            "Kabelo",
            "Nkosi",
            "+27 79 678 9012",
            "kabelo.nkosi@example.com",
            new DateOnly(1994, 9, 30),
            'M',
            "Finance analyst who enjoys hiking, board games and a well-stocked fridge.",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["High Speed WiFi", "Furnished", "Security", "Parking"],
            ["No Smoking", "No Parties"]),

        new(
            "Seafront room in Camps Bay",
            "Stunning seafront room with Atlantic views in a modern duplex. Walk to Camps Bay beachfront, restaurants and the mountain trails.",
            "Western Cape",
            "5 Victoria Road",
            "Duplex 1",
            "Camps Bay",
            "8040",
            "Room",
            9800,
            9800,
            1,
            1,
            new DateOnly(2026, 9, 15),
            "within 1 hour",
            "Thandi",
            "Mokoena",
            "+27 71 234 5678",
            "thandi.mokoena@example.com",
            new DateOnly(1993, 5, 12),
            'F',
            "Digital marketer who loves running along the promenade and hosting braais on weekends.",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["High Speed WiFi", "Balcony", "Air Conditioning", "Security"],
            ["No Smoking", "Quiet Hours"]),

        new(
            "Downtown flat near the CBD",
            "Bright 2-bedroom flat on the edge of the CBD, close to transport, coffee shops and nightlife. Secure building with 24-hour access.",
            "Gauteng",
            "112 Bree Street",
            "Flat 5",
            "Johannesburg CBD",
            "2001",
            "Flat",
            9500,
            9500,
            2,
            1,
            new DateOnly(2026, 8, 25),
            "within 24 hours",
            "Sipho",
            "Dlamini",
            "+27 76 789 0123",
            "sipho.dlamini@example.com",
            new DateOnly(1992, 1, 8),
            'M',
            "Graphic designer, night owl and part-time DJ.",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&q=80&w=1000&h=700", true),
                ("https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1000&h=700", false),
            ],
            ["High Speed WiFi", "Security", "Laundry"],
            ["No Smoking", "No Pets"]),

        new(
            "Backpacker lodge double room",
            "Comfortable double room in a friendly backpacker lodge, two blocks from the beachfront. Shared kitchen, Wi-Fi and weekly cleaning.",
            "KwaZulu-Natal",
            "28 Snell Parade",
            "Room 4",
            "North Beach",
            "4001",
            "Backpacker Lodge",
            4200,
            4200,
            1,
            1,
            new DateOnly(2026, 9, 1),
            "within a day",
            "Aisha",
            "Patel",
            "+27 73 456 7890",
            "aisha.patel@example.com",
            new DateOnly(1996, 2, 20),
            'F',
            "Interior designer who loves the beach, good food and quiet Sunday mornings.",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
            [
                ("https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700", true),
            ],
            ["High Speed WiFi", "Laundry", "Cleaning Service"],
            ["No Smoking", "No Parties", "No Drugs"]),
    ];
}
