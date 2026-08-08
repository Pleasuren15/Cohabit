namespace cohabit.comms.api.Features.Otp;

/// <summary>Payload handed to a dispatcher so it can render and send the OTP on a given channel.</summary>
public sealed record OtpDispatchContext(string Destination, string Code);

/// <summary>Delivers an OTP through a specific gateway (SMS, email, ...).</summary>
public interface IMessageDispatcher
{
    OtpChannel Channel { get; }

    Task DispatchAsync(OtpDispatchContext context, CancellationToken ct = default);
}
