namespace cohabit.application.Features.BulkSms;

// ── DTOs shared across the BulkSms feature ──────────────────────────

public sealed record SendSmsRequest(string To, string Body);

public sealed record BulkSmsMessageDto(
    string Id,
    string To,
    string Body,
    string Status,
    DateTime CreatedAt,
    DateTime? SentAt);

public interface IBulkSmsClient
{
    /// <summary>Send an SMS via the BulkSMS provider.</summary>
    Task<BulkSmsMessageDto> SendAsync(SendSmsRequest request, CancellationToken ct = default);

    /// <summary>Retrieve all messages from BulkSMS.</summary>
    Task<IReadOnlyList<BulkSmsMessageDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>Retrieve a single message by the provider's ID.</summary>
    Task<BulkSmsMessageDto?> GetByIdAsync(string id, CancellationToken ct = default);
}
