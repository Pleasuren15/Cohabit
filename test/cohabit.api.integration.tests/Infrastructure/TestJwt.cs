using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace cohabit.api.integration.tests.Infrastructure;

/// <summary>
///     Issues HS256 JWTs shaped like Supabase access tokens so integration
///     tests can exercise the protected auth endpoints.
/// </summary>
public static class TestJwt
{
    public const string SigningKey = "test-signing-key-that-is-long-enough-for-hs256-0123456789";
    public const string Issuer = "https://test.supabase.co/auth/v1";
    public const string Audience = "authenticated";

    public static string CreateToken(
        Guid userId,
        string email = "jane@example.com",
        string? phone = "0812345678",
        object? metadata = null,
        DateTime? expires = null,
        string? signingKey = null)
    {
        var claims = new List<Claim>
        {
            new("sub", userId.ToString()),
            new("role", "authenticated"),
            new("aud", Audience)
        };
        if (email is not null) claims.Add(new Claim("email", email));
        if (phone is not null) claims.Add(new Claim("phone", phone));
        if (metadata is not null)
            claims.Add(new Claim("user_metadata", JsonSerializer.Serialize(metadata)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey ?? SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: expires ?? DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
