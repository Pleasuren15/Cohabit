using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

namespace cohabit.comms.api.Features.Otp;

/// <summary>Stores issued OTP codes keyed by the SHA-256 hash of the user id.</summary>
public interface IOtpCodeStore
{
    void Save(Guid userId, OtpChannel channel, string code);

    bool TryGet(Guid userId, OtpChannel channel, out string? code);

    void Remove(Guid userId, OtpChannel channel);
}

/// <summary>In-memory OTP store backed by <see cref="IMemoryCache"/> with a 5 minute TTL.</summary>
public sealed class InMemoryOtpCodeStore(IMemoryCache cache) : IOtpCodeStore
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);

    public void Save(Guid userId, OtpChannel channel, string code)
    {
        cache.Set(CacheKey(userId, channel), code, Ttl);
    }

    public bool TryGet(Guid userId, OtpChannel channel, out string? code)
    {
        return cache.TryGetValue(CacheKey(userId, channel), out code);
    }

    public void Remove(Guid userId, OtpChannel channel)
    {
        cache.Remove(CacheKey(userId, channel));
    }

    private static string CacheKey(Guid userId, OtpChannel channel)
        => $"otp:{Sha256(userId.ToString())}:{channel}";

    private static string Sha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
