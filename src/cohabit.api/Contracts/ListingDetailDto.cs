namespace cohabit.api.Contracts;

public sealed record ListingDetailDto(
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
    ListingAddressDto Address,
    IReadOnlyList<string> Images,
    IReadOnlyList<string> Amenities,
    IReadOnlyList<string> Rules,
    IReadOnlyList<ListingVerificationDto> OwnerVerifications);
