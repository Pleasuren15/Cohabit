namespace cohabit.api.Contracts;

public sealed record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? Cellphone,
    string? Email,
    DateOnly DateOfBirth,
    char Gender,
    string? Bio,
    string? AvatarUrl,
    bool IsOtpVerified,
    Guid? AddressId,
    DateTime Timestamp);
