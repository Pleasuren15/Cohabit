namespace cohabit.comms.api.Features.Otp;

/// <summary>Rate limiting settings for the OTP request endpoint.</summary>
public static class RateLimitPolicies
{
    /// <summary>Rate limiter policy applied to OTP request dispatches.</summary>
    public const string OtpRequest = "otp-request";

    /// <summary>Maximum OTP requests allowed per user within <see cref="OtpRequestWindow"/>.</summary>
    public const int OtpRequestsPerWindow = 2;

    /// <summary>Window during which a user may request up to <see cref="OtpRequestsPerWindow"/> OTPs.</summary>
    public static readonly TimeSpan OtpRequestWindow = TimeSpan.FromMinutes(15);
}
