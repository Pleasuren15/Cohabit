namespace cohabit.api.Contracts;

public sealed record ListingQuery(int? ProvinceId, ListingKind? Type, string? Q, int Page, int PageSize);
