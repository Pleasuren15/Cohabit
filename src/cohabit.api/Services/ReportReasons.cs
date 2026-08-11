namespace cohabit.api.Services;

/// <summary>
///     The report reasons a viewer can choose from when flagging a listing,
///     mirroring the options surfaced in the web app's report dialog.
/// </summary>
public static class ReportReasons
{
    private static readonly IReadOnlyDictionary<string, string> Labels = new Dictionary<string, string>
    {
        ["scam"] = "It's a scam",
        ["misleading"] = "Misleading information",
        ["inappropriate"] = "Inappropriate content",
        ["fraud"] = "Deposit or payment fraud",
        ["unsafe"] = "Unsafe or suspicious listing",
        ["other"] = "Something else"
    };

    public static bool IsValid(string reason) => Labels.ContainsKey(reason);

    public static string LabelFor(string reason) =>
        Labels.TryGetValue(reason, out var label) ? label : reason;
}
