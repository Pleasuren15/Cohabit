using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IUserVerificationAccessor
{
    /// <summary>
    ///     Resolves a seeded verification type row by its lookup name.
    /// </summary>
    Task<VerificationType> GetVerificationTypeAsync(
        cohabit.application.Domain.Enums.VerificationTypeName name,
        CancellationToken ct = default);

    Task<bool> HasPendingAsync(Guid userId, int verificationTypeId, CancellationToken ct = default);

    Task<UserVerification> AddAsync(UserVerification verification, CancellationToken ct = default);

    Task<UserVerification?> FindByIdAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<UserVerification>> GetForUserAsync(Guid userId, CancellationToken ct = default);
}
