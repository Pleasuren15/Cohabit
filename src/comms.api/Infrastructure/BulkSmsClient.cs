using System.Text;
using System.Text.Json;
using cohabit.application.Features.BulkSms;

namespace cohabit.comms.api.Infrastructure;

public sealed class BulkSmsClient(HttpClient httpClient, ILogger<BulkSmsClient> logger) : IBulkSmsClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<BulkSmsMessageDto> SendAsync(SendSmsRequest request, CancellationToken ct = default)
    {
        try
        {
            var code = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
            var body = $"Cohabit > Your OTP is {code}";

            var payload = JsonSerializer.Serialize(new { to = request.To, body }, JsonOptions);
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "messages")
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Authorization = httpClient.DefaultRequestHeaders.Authorization;

            using var response = await httpClient.SendAsync(httpRequest, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                logger.LogError("BulkSMS returned {StatusCode}: {Body}", (int)response.StatusCode, errorBody);
                response.EnsureSuccessStatusCode();
            }

            var messages = await response.Content.ReadFromJsonAsync<List<BulkSmsMessageDto>>(JsonOptions, ct);
            return messages?.FirstOrDefault() ?? throw new InvalidOperationException("BulkSMS returned empty response.");
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
            var response = await httpClient.GetAsync("messages", ct);
            response.EnsureSuccessStatusCode();

            var messages = await response.Content.ReadFromJsonAsync<List<BulkSmsMessageDto>>(JsonOptions, ct);
            return messages!;
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
            var response = await httpClient.GetAsync($"messages/{id}", ct);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<BulkSmsMessageDto>(JsonOptions, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BulkSMS get message by ID failed: {Id}", id);
            throw;
        }
    }
}
