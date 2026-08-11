using System.Collections.Concurrent;
using cohabit.api.Services;

namespace cohabit.api.integration.tests.Infrastructure;

/// <summary>
///     In-memory replacement for <see cref="IReportEmailSender"/> registered by the test
///     factory so integration tests never reach the real Resend gateway. Captures every
///     context sent so tests can assert on the would-be email.
/// </summary>
public sealed class CapturingReportEmailSender : IReportEmailSender
{
    private static readonly ConcurrentQueue<ReportEmailContext> Sent = new();

    public static IReadOnlyList<ReportEmailContext> All() => Sent.ToArray();

    public static ReportEmailContext? Last()
    {
        if (Sent.TryPeek(out var last))
            return last;
        return null;
    }

    public static void Clear()
    {
        while (Sent.TryDequeue(out _))
        {
        }
    }

    public Task SendAsync(ReportEmailContext context, CancellationToken ct = default)
    {
        Sent.Enqueue(context);
        return Task.CompletedTask;
    }
}
