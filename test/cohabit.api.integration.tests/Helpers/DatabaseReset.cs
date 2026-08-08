using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.integration.tests.Helpers;

public static class DatabaseReset
{
    private const string TruncateSql =
        "TRUNCATE TABLE listings.watch_list, listings.listing_rules, listings.listing_amenities, " +
        "listings.images, listings.listings, locations.addresses, identity.user_verifications, " +
        "identity.users, messaging.messages, messaging.conversations CASCADE;";

    public static async Task TruncateAsync()
    {
        await using var db = TestDbContext.Create();
        await db.Database.ExecuteSqlRawAsync(TruncateSql);
        await EnsureSystemUserAsync(db);
    }

    private static async Task EnsureSystemUserAsync(CohabitDbContext db)
    {
        var provinceId = (await db.Provinces
                .OrderBy(p => p.Id)
                .Select(p => (int?)p.Id)
                .FirstOrDefaultAsync())
            ?? 1;

        var address = Address.Create("1 System Lane", "", "Sandton", "2196", provinceId);
        db.Addresses.Add(address);

        var user = User.Create(
            "Cohabit",
            "System",
            "+27 00 000 0000",
            "system@cohabit.local",
            new DateOnly(2000, 1, 1),
            'U',
            "Cohabit system notifications.",
            address.Id,
            SystemUser.Id);
        db.Users.Add(user);

        await db.SaveChangesAsync();
    }
}
