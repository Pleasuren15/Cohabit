using System.Security.Claims;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.Services;

public sealed class AuthService(
    CohabitDbContext dbContext,
    IHttpContextAccessor httpContextAccessor) : IAuthService
{
    public async Task<User> SyncUserFromJwt(CancellationToken ct = default)
    {
        var principal = httpContextAccessor.HttpContext?.User
            ?? throw new UnauthorizedAccessException("No authenticated user found in request context.");

        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("JWT is missing the 'sub' claim.");

        var firstName = principal.FindFirstValue("firstname")
            ?? principal.FindFirstValue("given_name")
            ?? throw new InvalidOperationException("JWT is missing firstname/given_name claim.");

        var lastName = principal.FindFirstValue("lastname")
            ?? principal.FindFirstValue("family_name")
            ?? throw new InvalidOperationException("JWT is missing lastname/family_name claim.");

        var dateOfBirthClaim = principal.FindFirstValue("dateofbirth")
            ?? principal.FindFirstValue("birthdate")
            ?? throw new InvalidOperationException("JWT is missing dateofbirth/birthdate claim.");

        if (!DateOnly.TryParse(dateOfBirthClaim, out var dateOfBirth))
            throw new InvalidOperationException($"Invalid dateofbirth claim value: '{dateOfBirthClaim}'.");

        var genderClaim = principal.FindFirstValue("gender")
            ?? throw new InvalidOperationException("JWT is missing gender claim.");

        if (genderClaim.Length != 1)
            throw new InvalidOperationException($"Invalid gender claim value: '{genderClaim}'. Expected a single character.");

        var gender = genderClaim[0];

        var existingUser = await dbContext.Users.FirstOrDefaultAsync(
            u => u.FirstName == firstName && u.LastName == lastName && u.DateOfBirth == dateOfBirth, ct);

        if (existingUser is not null)
            return existingUser;

        var user = User.CreateFromJwt(firstName, lastName, dateOfBirth, gender);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(ct);

        return user;
    }
}