using Microsoft.Extensions.Options;
using RestSharp;
using RestSharp.Authenticators;

namespace cohabit.comms.api.Features.Messaging.Sms;

/// <summary>Active SMS provider backed by the SMS Portal (smsportal.com) BulkMessages API.</summary>
public sealed class SmsPortalSmsProvider(
    RestClient client,
    IOptions<SmsPortalOptions> options,
    ILogger<SmsPortalSmsProvider> logger) : ISmsProvider
{
    public async Task SendAsync(SmsMessage message, CancellationToken ct = default)
    {
        var request = new RestRequest("", Method.Post)
            .AddJsonBody(new
            {
                messages = new[]
                {
                    new
                    {
                        content = message.Body,
                        destination = NormalizeDestination(message.To)
                    }
                }
            });
        request.Authenticator = new HttpBasicAuthenticator(options.Value.Username, options.Value.Password);

        var response = await client.ExecuteAsync(request, ct);

        if (!response.IsSuccessful)
        {
            logger.LogError("SMS Portal returned {(int)StatusCode}: {Content}", (int)response.StatusCode, response.Content);
            throw new InvalidOperationException($"SMS Portal send failed ({(int)response.StatusCode}): {response.Content}");
        }

        logger.LogInformation("SMS sent to {To} via {Provider}", message.To, "SmsPortal");
    }

    /// <summary>SMS Portal expects E.164 destinations without a leading '+'.</summary>
    private static string NormalizeDestination(string destination) => destination.TrimStart('+');
}
