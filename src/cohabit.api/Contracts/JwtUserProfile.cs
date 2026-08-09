namespace cohabit.api.Contracts;

/// <summary>
///     The identity profile resolved from an authenticated JWT. Used by the
///     auth sync flow to upsert the user into the internal <c>users</c> table.
/// </summary>
public sealed record JwtUserProfile(
    Guid UserId,
    string? FirstName,
    string? LastName,
    string? Email,
    string? Cellphone,
    DateOnly? DateOfBirth,
    char Gender,
    string? AvatarUrl);
