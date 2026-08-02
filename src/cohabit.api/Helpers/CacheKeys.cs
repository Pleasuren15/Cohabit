using cohabit.api.Contracts;

namespace cohabit.api.Helpers;

public static class CacheKeys
{
    public const string Provinces = "provinces:all";
    public const string UsersList = "users:all";
    public const string ListingBrowsePrefix = "listings:browse:";
    public const string ListingDetailPrefix = "listings:detail:";
    public const string AddressBrowsePrefix = "addresses:browse:";
    public const string AddressDetailPrefix = "addresses:detail:";

    public static string ListingBrowse(ListingQuery query) =>
        $"{ListingBrowsePrefix}{query.ProvinceId}:{query.Type}:{query.Q}:{query.Page}:{query.PageSize}";

    public static string ListingDetail(Guid id) => $"{ListingDetailPrefix}{id}";

    public static string AddressBrowse(AddressQuery query) =>
        $"{AddressBrowsePrefix}{query.ProvinceId}:{query.Q}";

    public static string AddressDetail(Guid id) => $"{AddressDetailPrefix}{id}";

    public static string UserListings(Guid userId) => $"users:{userId}:listings";
}
