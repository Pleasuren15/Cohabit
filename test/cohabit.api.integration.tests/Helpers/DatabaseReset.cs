using cohabit.application.Data;
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
    }
}
