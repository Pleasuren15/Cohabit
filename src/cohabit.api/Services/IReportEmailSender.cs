using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IReportEmailSender
{
    Task SendAsync(ReportEmailContext context, CancellationToken ct = default);
}

public sealed record ReportEmailContext(
    ReportListingRequest Request,
    ListingDetailDto Listing,
    string RecipientEmail,
    Guid ReportId,
    DateTime SubmittedAt);
