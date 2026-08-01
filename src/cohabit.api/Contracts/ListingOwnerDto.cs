namespace cohabit.api.Contracts;

public sealed record ListingOwnerDto(Guid Id, string FirstName, string LastName, string? AvatarUrl);
