namespace cohabit.api.Contracts;

/// <summary>
///     A single identity-document submission with its review state. Image URLs are
///     short-lived signed links into the private document store.
/// </summary>
public sealed record UserVerificationDto(
    Guid Id,
    string Type,
    string Status,
    string? FrontImageUrl,
    string? BackImageUrl,
    DateTime SubmittedAt,
    DateTime? ReviewedAt,
    string? RejectionReason);
