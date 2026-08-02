namespace cohabit.api.Contracts;

public sealed record UpdateUserRequest(
    string FirstName,
    string LastName,
    string Cellphone,
    string Email,
    DateOnly DateOfBirth,
    char Gender,
    string? Bio,
    Guid AddressId);
