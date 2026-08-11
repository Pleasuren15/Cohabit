namespace cohabit.api.Contracts;

public sealed record ReportListingRequest(
    Guid ListingId,
    string ReporterName,
    string Reason,
    string? Details);
