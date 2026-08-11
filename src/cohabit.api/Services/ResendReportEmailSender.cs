using Microsoft.Extensions.Options;
using Resend;

namespace cohabit.api.Services;

/// <summary>Sends property-report notifications to the safety team via the Resend gateway.</summary>
public sealed class ResendReportEmailSender(
    IResend resend,
    IOptions<ReportOptions> options,
    ILogger<ResendReportEmailSender> logger) : IReportEmailSender
{
    public async Task SendAsync(ReportEmailContext context, CancellationToken ct = default)
    {
        var message = new EmailMessage
        {
            From = string.IsNullOrWhiteSpace(options.Value.From) ? ReportOptions.DefaultFrom : options.Value.From,
            To = context.RecipientEmail,
            Subject = $"[Cohabit] Property report — {context.Listing.Title}",
            HtmlBody = ReportEmailHtml.Build(context.Request, context.Listing, context.ReportId, context.SubmittedAt)
        };

        var response = await resend.EmailSendAsync(message, ct);

        if (!response.Success)
        {
            var error = response.Exception?.Message ?? "Resend returned an unsuccessful response.";
            logger.LogError("Report email send failed for listing {ListingId}: {Error}", context.Listing.Id, error);
            throw new InvalidOperationException($"Resend email send failed: {error}");
        }

        logger.LogInformation(
            "Report email for listing {ListingId} sent to {To} (id {Id})",
            context.Listing.Id,
            context.RecipientEmail,
            response.Content);
    }
}
