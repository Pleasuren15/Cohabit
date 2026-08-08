namespace cohabit.api.Contracts;

public sealed record ListingAddressDto(
    string AddressLine1,
    string AddressLine2,
    string Suburb,
    string PostalCode,
    ProvinceDto Province);