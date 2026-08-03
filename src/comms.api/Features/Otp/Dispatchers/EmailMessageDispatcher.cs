using Microsoft.Extensions.Options;
using Resend;

namespace cohabit.comms.api.Features.Otp.Dispatchers;

/// <summary>Dispatches OTP codes as transactional emails via the Resend gateway.</summary>
public sealed class EmailMessageDispatcher(
    IResend resend,
    IOptions<EmailOptions> options,
    ILogger<EmailMessageDispatcher> logger) : IMessageDispatcher
{
    public OtpChannel Channel => OtpChannel.Email;

    public async Task DispatchAsync(OtpDispatchContext context, CancellationToken ct = default)
    {
        var message = new EmailMessage
        {
            From = options.Value.From,
            To = context.Destination,
            Subject = "Your Cohabit OTP",
            HtmlBody =
                $"<p>Your Cohabit verification code is <strong>{context.Code}</strong>.</p>" +
                "<p>It expires in 5 minutes.</p>"
        };

        var response = await resend.EmailSendAsync(message, ct);

        if (!response.Success)
        {
            var error = response.Exception?.Message ?? "Resend returned an unsuccessful response.";
            logger.LogError("Resend email send failed for {To}: {Error}", context.Destination, error);
            throw new InvalidOperationException($"Resend email send failed: {error}");
        }

        logger.LogInformation("OTP email sent to {To} (id {Id})", context.Destination, response.Content);
    }
}

/// <summary>Resend options read from the "Resend" configuration section.</summary>
public sealed class EmailOptions
{
    public const string SectionName = "Resend";

    public string From { get; set; } = string.Empty;
}
