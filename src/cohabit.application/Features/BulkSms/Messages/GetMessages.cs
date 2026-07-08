namespace cohabit.application.Features.BulkSms.Messages;

public sealed class GetAllMessagesHandler(IBulkSmsClient smsClient)
{
    public async Task<IReadOnlyList<BulkSmsMessageDto>> HandleAsync(CancellationToken ct = default)
    {
        return await smsClient.GetAllAsync(ct);
    }
}

public sealed class GetMessageByIdHandler(IBulkSmsClient smsClient)
{
    public async Task<BulkSmsMessageDto?> HandleAsync(string id, CancellationToken ct = default)
    {
        return await smsClient.GetByIdAsync(id, ct);
    }
}
