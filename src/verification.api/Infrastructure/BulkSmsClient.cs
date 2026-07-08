using System.Net.Http.Json;
using cohabit.application.Features.BulkSms;

namespace cohabit.verification.api.Infrastructure;

public sealed class BulkSmsClient(HttpClient httpClient, ILogger<BulkSmsClient> logger) : IBulkSmsClient
{

    public async Task<BulkSmsMessageDto> SendAsync(SendSmsRequest request, CancellationToken ct = default)
    {
        try
        {
            var payload = new { to = request.To, body = request.Body };
            var response = await httpClient.PostAsJsonAsync("/messages", payload, ct);
            response.EnsureSuccessStatusCode();

            var dto = await response.Content.ReadFromJsonAsync<BulkSmsMessageDto>(ct);
            return dto ?? throw new InvalidOperationException("BulkSMS returned null response.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BulkSMS send failed to {To}", request.To);
            throw;
        }
    }

    public async Task<IReadOnlyList<BulkSmsMessageDto>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var response = await httpClient.GetAsync("/messages", ct);
            response.EnsureSuccessStatusCode();

            var messages = await response.Content.ReadFromJsonAsync<List<BulkSmsMessageDto>>(ct);
            return (IReadOnlyList<BulkSmsMessageDto>)(messages ?? []);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BulkSMS list messages failed");
            throw;
        }
    }

    public async Task<BulkSmsMessageDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        try
        {
            var response = await httpClient.GetAsync($"/messages/{id}", ct);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<BulkSmsMessageDto>(ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BulkSMS get message by ID failed: {Id}", id);
            throw;
        }
    }
}
