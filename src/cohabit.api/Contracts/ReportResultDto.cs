namespace cohabit.api.Contracts;

public sealed record ReportResultDto(
    Guid ListingId,
    string Reason,
    string Status,
    DateTime SubmittedAt);
