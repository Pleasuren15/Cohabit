using System.Security.Claims;
using System.Text.Json;
using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

/// <summary>
///     Synchronises an authenticated Supabase user into the internal database.
///     Called once after every login/register with the user's access token.
/// </summary>
[ApiController]
[Route("api/auth")]
[Authorize]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    ///     Upserts the user described by the JWT into the <c>users</c> table and,
    ///     on first sync, sends the welcome message to their Messages tab.
    /// </summary>
    [HttpPost("sync")]
    public async Task<ActionResult<UserDto>> Sync(CancellationToken ct = default)
    {
        if (!TryGetProfile(User, out var profile))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unable to identify the user from the token"
            });
        }

        var user = await authService.SyncAsync(profile, ct);
        return Ok(user);
    }

    /// <summary>
    ///     Resolves the identity profile from the JWT claims. Returns
    ///     <c>false</c> when the token has no usable <c>sub</c> claim.
    /// </summary>
    public static bool TryGetProfile(ClaimsPrincipal principal, out JwtUserProfile profile)
    {
        profile = null!;

        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var userId))
            return false;

        var metadata = ParseObject(principal.FindFirstValue("user_metadata"));

        var fullName = GetString(metadata, "full_name");
        var firstName = GetString(metadata, "first_name") ?? FirstToken(fullName);
        var lastName = GetString(metadata, "last_name") ?? RestAfterFirstToken(fullName);

        var cellphone = principal.FindFirstValue("phone_number")
            ?? principal.FindFirstValue("phone")
            ?? GetString(metadata, "phone");
        var email = principal.FindFirstValue("email")
            ?? GetString(metadata, "email");

        var dobRaw = GetString(metadata, "date_of_birth");
        DateOnly? dob = DateOnly.TryParse(dobRaw, out var parsedDob) ? parsedDob : null;

        var genderRaw = GetString(metadata, "gender");
        var gender = genderRaw?.ToUpperInvariant() is "M" or "F"
            ? genderRaw[0]
            : 'U';

        profile = new JwtUserProfile(
            userId,
            firstName,
            lastName,
            email,
            cellphone,
            dob,
            gender,
            GetString(metadata, "avatar_url"));

        return true;
    }

    private static JsonElement? ParseObject(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            using var document = JsonDocument.Parse(json);
            return document.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string? GetString(JsonElement? element, string property)
    {
        if (element is not { } e
            || !e.TryGetProperty(property, out var value)
            || value.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        var text = value.GetString();
        return string.IsNullOrWhiteSpace(text) ? null : text;
    }

    private static string? FirstToken(string? value)
    {
        var tokens = value?.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return tokens is { Length: > 0 } ? tokens[0] : null;
    }

    private static string? RestAfterFirstToken(string? value)
    {
        var tokens = value?.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return tokens is { Length: > 1 } ? string.Join(' ', tokens.Skip(1)) : null;
    }
}
