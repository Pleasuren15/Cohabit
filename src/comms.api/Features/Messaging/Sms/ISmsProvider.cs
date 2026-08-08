namespace cohabit.comms.api.Features.Messaging.Sms;

/// <summary>An SMS to be delivered through the active SMS provider.</summary>
public sealed record SmsMessage(string To, string Body);

/// <summary>Delivers SMS messages through the single configured gateway.</summary>
public interface ISmsProvider
{
    Task SendAsync(SmsMessage message, CancellationToken ct = default);
}
