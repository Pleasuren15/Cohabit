namespace cohabit.comms.api.Features.Otp;

/// <summary>Claim types used by the OTP controller to resolve the user from the JWT.</summary>
public static class JwtClaims
{
    public const string UserId = "sub";
    public const string Cellphone = "phone_number";
    public const string Email = "email";
}
