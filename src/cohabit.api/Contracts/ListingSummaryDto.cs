namespace cohabit.api.Contracts;

public sealed record ListingSummaryDto(
    Guid Id,
    string Title,
    string Description,
    int TypeId,
    string Type,
    int Price,
    int Deposit,
    int Beds,
    int Baths,
    DateOnly AvailableFrom,
    string ResponseTime,
    string? PrimaryImageUrl,
    ListingOwnerDto Owner,
    ListingAddressDto Address);
