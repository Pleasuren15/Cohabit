using System.ComponentModel.DataAnnotations;

namespace cohabit.comms.api.Features.Otp;

/// <summary>Body of a request to dispatch an OTP via the selected channel.</summary>
public sealed record SendOtpRequest(
    [EnumDataType(typeof(OtpChannel))]
    OtpChannel Channel);

/// <summary>Result of a dispatched OTP. The destination is masked to avoid leaking PII.</summary>
public sealed record SendOtpResponse(OtpChannel Channel, string Destination);

/// <summary>Body of a request to verify the OTP received on the selected channel.</summary>
public sealed record VerifyOtpRequest(
    [EnumDataType(typeof(OtpChannel))]
    OtpChannel Channel,
    [Required, RegularExpression(@"^\d{6}$")]
    string Code);

/// <summary>Result of an OTP verification attempt. Consumed codes are invalidated on use.</summary>
public sealed record VerifyOtpResponse(OtpChannel Channel, bool IsValid);
