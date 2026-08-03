using System.Security.Cryptography;

namespace cohabit.comms.api.Features.Otp;

/// <summary>Generates cryptographically random OTP codes.</summary>
public interface IOtpCodeGenerator
{
    string Generate();
}

/// <summary>Generates a 6-digit OTP using a cryptographic random number generator.</summary>
public sealed class RandomOtpCodeGenerator : IOtpCodeGenerator
{
    public string Generate()
    {
        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    }
}
