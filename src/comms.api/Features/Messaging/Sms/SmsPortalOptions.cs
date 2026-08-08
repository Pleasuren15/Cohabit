namespace cohabit.comms.api.Features.Messaging.Sms;

/// <summary>SMS Portal provider options read from the "SmsPortal" configuration section.</summary>
public sealed class SmsPortalOptions
{
    public const string SectionName = "SmsPortal";

    /// <summary>Base endpoint for BulkMessages submissions.</summary>
    public string BaseUrl { get; set; } = "https://rest.smsportal.com/v3/BulkMessages";

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
