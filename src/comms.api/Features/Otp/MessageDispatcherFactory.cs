namespace cohabit.comms.api.Features.Otp;

/// <summary>Selects the message dispatcher for a given OTP channel.</summary>
public sealed class MessageDispatcherFactory(IEnumerable<IMessageDispatcher> dispatchers)
{
    public IMessageDispatcher GetFor(OtpChannel channel)
    {
        var dispatcher = dispatchers.FirstOrDefault(d => d.Channel == channel);
        return dispatcher ?? throw new InvalidOperationException($"No message dispatcher registered for channel '{channel}'.");
    }
}
