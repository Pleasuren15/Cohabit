using System.Security.Cryptography;
using System.Text;
using cohabit.comms.api.Features.Otp.Dispatchers;

namespace cohabit.comms.api.Features.Otp;

/// <summary>Orchestrates OTP generation, dispatch and storage.</summary>
public interface IOtpService
{
    Task<SendOtpResponse> SendAsync(OtpChannel channel, string destination, Guid userId, CancellationToken ct = default);

    Task<bool> VerifyAsync(OtpChannel channel, string code, Guid userId, CancellationToken ct = default);
}

/// <summary>
/// Generates the code, dispatches it through the channel's dispatcher and stores
/// it in the in-memory OTP store. One dispatcher per channel is wired in directly.
/// </summary>
public sealed class OtpService(
    SmsMessageDispatcher smsDispatcher,
    EmailMessageDispatcher emailDispatcher,
    IOtpCodeGenerator codeGenerator,
    IOtpCodeStore codeStore,
    ILogger<OtpService> logger) : IOtpService
{
    public async Task<SendOtpResponse> SendAsync(OtpChannel channel, string destination, Guid userId, CancellationToken ct = default)
    {
        var code = codeGenerator.Generate();
        var dispatcher = GetDispatcher(channel);

        await dispatcher.DispatchAsync(new OtpDispatchContext(destination, code), ct);
        codeStore.Save(userId, channel, code);

        logger.LogInformation("OTP sent via {Channel} for user {UserId}", channel, userId);

        return new SendOtpResponse(channel, MaskDestination(destination));
    }

    private IMessageDispatcher GetDispatcher(OtpChannel channel) => channel switch
    {
        OtpChannel.Sms => smsDispatcher,
        OtpChannel.Email => emailDispatcher,
        _ => throw new InvalidOperationException($"No message dispatcher registered for channel '{channel}'.")
    };

    public Task<bool> VerifyAsync(OtpChannel channel, string code, Guid userId, CancellationToken ct = default)
    {
        if (!codeStore.TryGet(userId, channel, out var stored))
        {
            logger.LogWarning("OTP verification attempted without a stored code for user {UserId} on {Channel}", userId, channel);
            return Task.FromResult(false);
        }

        codeStore.Remove(userId, channel);

        var isValid = CodesMatch(code, stored);
        logger.LogInformation("OTP verification for user {UserId} on {Channel} succeeded: {IsValid}", userId, channel, isValid);

        return Task.FromResult(isValid);
    }

    private static bool CodesMatch(string supplied, string? stored)
    {
        if (stored is null || supplied.Length != stored.Length)
            return false;

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(supplied),
            Encoding.UTF8.GetBytes(stored));
    }

    private static string MaskDestination(string destination)
    {
        if (destination.Length <= 4)
            return $"{destination[..1]}***";

        return $"{destination[..3]}***{destination[^2..]}";
    }
}
