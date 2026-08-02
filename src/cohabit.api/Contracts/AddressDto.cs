namespace cohabit.api.Contracts;

public sealed record AddressDto(
    Guid Id,
    string AddressLine1,
    string AddressLine2,
    string Suburb,
    string PostalCode,
    int ProvinceId,
    ProvinceDto Province);
