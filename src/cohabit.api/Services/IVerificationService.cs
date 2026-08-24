using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IVerificationService
{
    /// <summary>
    ///     Submits identity-document images for manual admin review.
    /// </summary>
    Task<UserVerificationDto> SubmitAsync(
        Guid userId,
        string documentType,
        IFormFile frontImage,
        IFormFile? backImage,
        CancellationToken ct = default);

    /// <summary>
    ///     Lists the caller's own submissions, newest first.
    /// </summary>
    Task<IReadOnlyList<UserVerificationDto>> GetMineAsync(Guid userId, CancellationToken ct = default);
}
