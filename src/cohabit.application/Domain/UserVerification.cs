using cohabit.application.Domain.Enums;

namespace cohabit.application.Domain;

public sealed class UserVerification
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int VerificationTypeId { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTime Timestamp { get; private set; }

    // Document review workflow. Rows created before this workflow existed have
    // no document paths and are excluded from the review queue.
    public VerificationStatus Status { get; private set; }
    public string? FrontImagePath { get; private set; }
    public string? BackImagePath { get; private set; }
    public Guid? ReviewedByUserId { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? RejectionReason { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public VerificationType VerificationType { get; private set; } = null!;

    private UserVerification() { }

    /// <summary>
    ///     Creates a pending identity-document submission awaiting manual review.
    /// </summary>
    public static UserVerification Create(
        Guid userId,
        int verificationTypeId,
        string frontImagePath,
        string? backImagePath)
    {
        return new UserVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VerificationTypeId = verificationTypeId,
            Status = VerificationStatus.Pending,
            FrontImagePath = frontImagePath,
            BackImagePath = backImagePath,
            IsVerified = false,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    ///     Marks the submission as reviewed and approved by an administrator.
    /// </summary>
    public void Approve(Guid reviewerId)
    {
        EnsurePending();
        Status = VerificationStatus.Approved;
        IsVerified = true;
        ReviewedByUserId = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = null;
    }

    /// <summary>
    ///     Marks the submission as reviewed and rejected with a mandatory reason.
    /// </summary>
    public void Reject(Guid reviewerId, string reason)
    {
        EnsurePending();
        Status = VerificationStatus.Rejected;
        IsVerified = false;
        ReviewedByUserId = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = reason.Trim();
    }

    private void EnsurePending()
    {
        if (Status != VerificationStatus.Pending)
            throw new InvalidOperationException(
                $"Verification '{Id}' has already been reviewed (status: {Status}).");
    }
}
