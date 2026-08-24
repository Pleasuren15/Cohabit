using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class UserVerificationAccessor(CohabitDbContext dbContext) : IUserVerificationAccessor
{
    public async Task<VerificationType> GetVerificationTypeAsync(
        VerificationTypeName name,
        CancellationToken ct = default)
    {
        var displayName = name.GetDescription();
        var type = await dbContext.VerificationTypes
            .AsNoTracking()
            .SingleOrDefaultAsync(v => v.Name == displayName, ct);

        if (type is null)
            throw new NotFoundException(
                "verification_type_not_found",
                $"Verification type '{displayName}' is not configured.");

        return type;
    }

    public Task<bool> HasPendingAsync(Guid userId, int verificationTypeId, CancellationToken ct = default)
    {
        return dbContext.UserVerifications
            .AsNoTracking()
            .AnyAsync(uv => uv.UserId == userId
                && uv.VerificationTypeId == verificationTypeId
                && uv.Status == VerificationStatus.Pending, ct);
    }

    public async Task<UserVerification> AddAsync(UserVerification verification, CancellationToken ct = default)
    {
        dbContext.UserVerifications.Add(verification);
        await dbContext.SaveChangesAsync(ct);
        return verification;
    }

    public async Task<UserVerification?> FindByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await dbContext.UserVerifications
            .Include(uv => uv.VerificationType)
            .FirstOrDefaultAsync(uv => uv.Id == id, ct);
    }

    public async Task<IReadOnlyList<UserVerification>> GetForUserAsync(Guid userId, CancellationToken ct = default)
    {
        return await dbContext.UserVerifications
            .AsNoTracking()
            .Include(uv => uv.VerificationType)
            .Where(uv => uv.UserId == userId)
            .OrderByDescending(uv => uv.Timestamp)
            .ToListAsync(ct);
    }
}
