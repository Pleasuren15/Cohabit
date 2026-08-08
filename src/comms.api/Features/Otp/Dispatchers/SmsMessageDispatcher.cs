using cohabit.comms.api.Features.Messaging.Sms;

namespace cohabit.comms.api.Features.Otp.Dispatchers;

/// <summary>Dispatches OTP codes as SMS via the SMS Portal gateway.</summary>
public sealed class SmsMessageDispatcher(ISmsProvider smsProvider) : IMessageDispatcher
{
    public OtpChannel Channel => OtpChannel.Sms;

    public async Task DispatchAsync(OtpDispatchContext context, CancellationToken ct = default)
    {
        var body = $"Cohabit > Your OTP is {context.Code}";
        await smsProvider.SendAsync(new SmsMessage(context.Destination, body), ct);
    }
}
