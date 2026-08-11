using cohabit.api.Contracts;
using cohabit.api.Infrastructure;
using Microsoft.Extensions.Options;

namespace cohabit.api.Services;

public sealed class ReportService(
    IListingService listingService,
    IReportEmailSender emailSender,
    IOptions<ReportOptions> options,
    ILogger<ReportService> logger) : IReportService
{
    public async Task<ReportResultDto> SubmitAsync(ReportListingRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || !ReportReasons.IsValid(request.Reason))
            throw new ValidationException("invalid_report_reason", "The report reason is not recognised.");

        var listing = await listingService.GetByIdAsync(request.ListingId, ct);

        var recipient = string.IsNullOrWhiteSpace(options.Value.RecipientEmail)
            ? ReportOptions.DefaultRecipientEmail
            : options.Value.RecipientEmail;

        var submittedAt = DateTime.UtcNow;
        var reportId = Guid.NewGuid();

        await emailSender.SendAsync(
            new ReportEmailContext(request, listing, recipient, reportId, submittedAt),
            ct);

        logger.LogInformation(
            "Listing {ListingId} reported as {Reason} by {Reporter}",
            listing.Id,
            request.Reason,
            request.ReporterName);

        return new ReportResultDto(listing.Id, request.Reason, "open", submittedAt);
    }
}
