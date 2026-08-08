namespace cohabit.api.Contracts;

public sealed record UpdateListingRequest(
    string Title,
    string Description,
    int TypeId,
    int Price,
    int Deposit,
    int Beds,
    int Baths,
    DateOnly AvailableFrom,
    string ResponseTime,
    string? AddressLine1,
    string? AddressLine2,
    string Suburb,
    string? PostalCode,
    int ProvinceId,
    IReadOnlyList<int>? AmenityIds,
    IReadOnlyList<int>? RuleIds);
