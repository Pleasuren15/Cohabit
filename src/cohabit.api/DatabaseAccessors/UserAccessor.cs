using cohabit.api.Contracts;
using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class UserAccessor(CohabitDbContext dbContext) : IUserAccessor
{
    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default)
    {
        return await dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync(ct);
    }

    public async Task<User> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedCellphone = request.Cellphone.Trim();

        await EnsureUniqueAsync(normalizedEmail, normalizedCellphone, userId: null, ct);

        await ValidateProfile(request.Gender, request.AddressId, ct);

        var user = User.Create(
            request.FirstName.Trim(),
            request.LastName.Trim(),
            normalizedCellphone,
            normalizedEmail,
            request.DateOfBirth,
            request.Gender,
            request.Bio?.Trim(),
            request.AddressId);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(ct);

        return user;
    }

    public async Task<User> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedCellphone = request.Cellphone.Trim();

        await EnsureUniqueAsync(normalizedEmail, normalizedCellphone, userId, ct);

        await ValidateProfile(request.Gender, request.AddressId, ct);

        user.Update(
            request.FirstName.Trim(),
            request.LastName.Trim(),
            normalizedCellphone,
            normalizedEmail,
            request.DateOfBirth,
            request.Gender,
            request.Bio?.Trim(),
            request.AddressId);

        await dbContext.SaveChangesAsync(ct);

        return user;
    }

    public async Task DeleteAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<(User User, bool IsNew)> SyncFromJwtAsync(JwtUserProfile profile, CancellationToken ct = default)
    {
        var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == profile.UserId, ct);
        if (existing is not null)
        {
            existing.UpdateFromJwt(
                profile.FirstName,
                profile.LastName,
                profile.DateOfBirth,
                profile.Gender,
                profile.Email,
                profile.Cellphone,
                profile.AvatarUrl);
            await dbContext.SaveChangesAsync(ct);
            return (existing, false);
        }

        var user = User.CreateFromJwt(
            profile.UserId,
            profile.FirstName ?? string.Empty,
            profile.LastName ?? string.Empty,
            profile.DateOfBirth,
            profile.Gender,
            profile.Email,
            profile.Cellphone,
            profile.AvatarUrl);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(ct);
        return (user, true);
    }

    private async Task EnsureUniqueAsync(
        string normalizedEmail,
        string normalizedCellphone,
        Guid? userId,
        CancellationToken ct = default)
    {
        if (await dbContext.Users.AnyAsync(u => u.Email == normalizedEmail && u.Id != userId, ct))
            throw new ConflictException("email_in_use", $"Email '{normalizedEmail}' is already in use.");

        if (await dbContext.Users.AnyAsync(u => u.Cellphone == normalizedCellphone && u.Id != userId, ct))
            throw new ConflictException("cellphone_in_use", $"Cellphone '{normalizedCellphone}' is already in use.");
    }

    private async Task ValidateProfile(char gender, Guid addressId, CancellationToken ct = default)
    {
        if (gender is not ('M' or 'F'))
            throw new ValidationException("gender_invalid", "Gender must be either 'M' or 'F'.");

        if (await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == addressId, ct) is null)
            throw new ValidationException("address_not_found", $"Address '{addressId}' was not found.");
    }
}
