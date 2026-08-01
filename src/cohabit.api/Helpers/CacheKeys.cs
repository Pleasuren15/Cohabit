using cohabit.api.Contracts;

namespace cohabit.api.Helpers;

public static class CacheKeys
{
    public const string Provinces = "provinces:all";

    public static string ListingBrowse(ListingQuery query) =>
        $"listings:browse:{query.ProvinceId}:{query.Type}:{query.Q}:{query.Page}:{query.PageSize}";

    public static string ListingDetail(Guid id) => $"listings:detail:{id}";
}
