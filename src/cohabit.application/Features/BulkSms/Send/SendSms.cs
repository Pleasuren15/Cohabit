namespace cohabit.application.Features.BulkSms.Send;

public sealed class SendSmsHandler(IBulkSmsClient smsClient)
{
    public async Task<BulkSmsMessageDto> HandleAsync(SendSmsRequest request, CancellationToken ct = default)
    {
        return await smsClient.SendAsync(request, ct);
    }
}
