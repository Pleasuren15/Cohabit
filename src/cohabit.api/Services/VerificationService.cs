using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Infrastructure;
using cohabit.application.Domain.Enums;

namespace cohabit.api.Services;

public sealed class VerificationService(
    IUserVerificationAccessor verificationAccessor,
    IIdDocumentStorage idDocumentStorage,
    ISystemMessagingService messagingService,
    ILogger<VerificationService> logger) : IVerificationService
{
    public const long MaxUploadSizeBytes = 8 * 1024 * 1024; // 8 MB
    private static readonly TimeSpan SignedUrlLifetime = TimeSpan.FromMinutes(15);

    public async Task<UserVerificationDto> SubmitAsync(
        Guid userId,
        string documentType,
        IFormFile frontImage,
        IFormFile? backImage,
        IFormFile selfieImage,
        CancellationToken ct = default)
    {
        if (frontImage is null || frontImage.Length == 0)
            throw new ValidationException("front_image_required", "A front image is required.");

        if (selfieImage is null || selfieImage.Length == 0)
            throw new ValidationException("selfie_required", "A selfie is required for identity verification.");

        var front = await ReadAndValidateImageAsync(frontImage, ct);
        var back = backImage is { Length: > 0 } ? await ReadAndValidateImageAsync(backImage, ct) : null;
        var selfie = await ReadAndValidateImageAsync(selfieImage, ct);

        var typeName = ParseTypeName(documentType);
        var verificationType = await verificationAccessor.GetVerificationTypeAsync(typeName, ct);

        if (await verificationAccessor.HasPendingAsync(userId, verificationType.Id, ct))
            throw new ConflictException("verification_pending",
                "A submission for this document type is already awaiting review.");

        var frontPath = await idDocumentStorage.UploadAsync(frontImage.FileName, front, frontImage.ContentType, ct);
        var backPath = back is not null
            ? await idDocumentStorage.UploadAsync(backImage!.FileName, back, backImage.ContentType, ct)
            : null;
        var selfiePath = await idDocumentStorage.UploadAsync(selfieImage.FileName, selfie, selfieImage.ContentType, ct);

        var verification = await verificationAccessor.AddAsync(
            cohabit.application.Domain.UserVerification.Create(userId, verificationType.Id, frontPath, backPath, selfiePath), ct);

        logger.LogInformation("User {UserId} submitted {DocumentType} for verification ({VerificationId})",
            userId, documentType, verification.Id);

        await NotifySubmissionAsync(userId, verificationType.Name, verification.Id,
            [frontPath, .. backPath is null ? [] : new[] { backPath }, selfiePath], ct);

        return await ToDtoAsync(verification, ct);
    }

    /// <summary>
    /// Sends the user an in-app message confirming their submission, with the
    /// uploaded document images attached. Best-effort: a messaging failure must
    /// not fail an already-persisted submission.
    /// </summary>
    private async Task NotifySubmissionAsync(
        Guid userId,
        string documentTypeName,
        Guid verificationId,
        IReadOnlyList<string> imagePaths,
        CancellationToken ct)
    {
        try
        {
            var content =
                $"We received your {documentTypeName.ToLowerInvariant()} photos and they are now awaiting review by our team. "
                + "You can check the status any time under Profile > Verify Your Identity. "
                + "We'll message you here as soon as a decision has been made.";

            await messagingService.SendAsync(
                userId,
                "ID Verification Submitted",
                content,
                imagePaths: imagePaths,
                ct: ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex,
                "Failed to send submission confirmation message to user {UserId} for verification {VerificationId}",
                userId, verificationId);
        }
    }

    public async Task<IReadOnlyList<UserVerificationDto>> GetMineAsync(Guid userId, CancellationToken ct = default)
    {
        var verifications = await verificationAccessor.GetForUserAsync(userId, ct);

        var dtos = new List<UserVerificationDto>(verifications.Count);
        foreach (var verification in verifications)
            dtos.Add(await ToDtoAsync(verification, ct));

        return dtos;
    }

    private async Task<UserVerificationDto> ToDtoAsync(cohabit.application.Domain.UserVerification verification, CancellationToken ct)
    {
        return new UserVerificationDto(
            verification.Id,
            verification.VerificationType.Name,
            verification.Status.ToString(),
            await ResolveUrlAsync(verification.FrontImagePath, ct),
            await ResolveUrlAsync(verification.BackImagePath, ct),
            await ResolveUrlAsync(verification.SelfieImagePath, ct),
            verification.Timestamp,
            verification.ReviewedAt,
            verification.RejectionReason);
    }

    private async Task<string?> ResolveUrlAsync(string? path, CancellationToken ct)
    {
        return path is null ? null : await idDocumentStorage.GetTemporaryReadUrlAsync(path, SignedUrlLifetime, ct);
    }

    private async Task<byte[]> ReadAndValidateImageAsync(IFormFile file, CancellationToken ct)
    {
        if (file.Length > MaxUploadSizeBytes)
            throw new ValidationException("image_too_large", "Each image must be 8 MB or smaller.");

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        var content = stream.ToArray();

        // Magic bytes win over client-supplied content types.
        var sniffed = ImageFormatDetector.Detect(content).ContentType;
        if (sniffed is not ("image/png" or "image/jpeg" or "image/webp"))
            throw new ValidationException("unsupported_image",
                "Images must be PNG, JPEG or WebP.");

        return content;
    }

    private static VerificationTypeName ParseTypeName(string documentType)
    {
        return documentType.Trim() switch
        {
            "identity_document" or nameof(VerificationTypeName.IdentityDocument) => VerificationTypeName.IdentityDocument,
            "passport" or nameof(VerificationTypeName.Passport) => VerificationTypeName.Passport,
            "drivers_license" or nameof(VerificationTypeName.DriversLicense) => VerificationTypeName.DriversLicense,
            _ => throw new ValidationException("unsupported_document_type",
                $"Document type '{documentType}' is not supported.")
        };
    }
}
