namespace cohabit.api.Contracts;

public sealed record CreateAddressRequest(
    string AddressLine1,
    string AddressLine2,
    string Suburb,
    string PostalCode,
    int ProvinceId);
