namespace cohabit.comms.api.Features.BulkSms;

// ── DTOs shared across the BulkSms feature ──────────────────────────

public sealed record SendSmsRequest(string To, string? Body = null);

public sealed record BulkSmsMessageDto(
    string Id,
    string Type,
    string? From,
    string To,
    string? Body,
    string? Encoding,
    int? ProtocolId,
    int? MessageClass,
    int? NumberOfParts,
    decimal? CreditCost,
    BulkSmsSubmissionDto? Submission,
    BulkSmsStatusDto? Status,
    string? RelatedSentMessageId,
    string? UserSuppliedId);

public sealed record BulkSmsSubmissionDto(string Id, DateTime Date);

public sealed record BulkSmsStatusDto(string Id, string Type, string? Subtype);

public interface IBulkSmsClient
{
    /// <summary>Send an SMS via the BulkSMS provider.</summary>
    Task<BulkSmsMessageDto> SendAsync(SendSmsRequest request, CancellationToken ct = default);

    /// <summary>Retrieve all messages from BulkSMS.</summary>
    Task<IReadOnlyList<BulkSmsMessageDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>Retrieve a single message by the provider's ID.</summary>
    Task<BulkSmsMessageDto?> GetByIdAsync(string id, CancellationToken ct = default);
}
