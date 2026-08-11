namespace cohabit.api.Services;

/// <summary>Options for the property-report notification email, read from the "Reports" section.</summary>
public sealed class ReportOptions
{
    public const string SectionName = "Reports";

    /// <summary>The inbox the safety team reads; used when no recipient is configured.</summary>
    public const string DefaultRecipientEmail = "pleasurendhlovu.dev@gmail.com";

    /// <summary>Resend sender; falls back to the platform sandbox sender when unset.</summary>
    public const string DefaultFrom = "Cohabit <onboarding@resend.dev>";

    public string RecipientEmail { get; set; } = string.Empty;

    public string From { get; set; } = string.Empty;
}
