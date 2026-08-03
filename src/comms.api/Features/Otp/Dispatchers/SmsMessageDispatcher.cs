using cohabit.comms.api.Features.BulkSms;

namespace cohabit.comms.api.Features.Otp.Dispatchers;

/// <summary>Dispatches OTP codes as SMS via the BulkSMS gateway.</summary>
public sealed class SmsMessageDispatcher(IBulkSmsClient smsClient) : IMessageDispatcher
{
    public OtpChannel Channel => OtpChannel.Sms;

    public async Task DispatchAsync(OtpDispatchContext context, CancellationToken ct = default)
    {
        var body = $"Cohabit > Your OTP is {context.Code}";
        await smsClient.SendAsync(new SendSmsRequest(context.Destination, body), ct);
    }
}
