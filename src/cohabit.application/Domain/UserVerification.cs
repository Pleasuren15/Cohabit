namespace cohabit.application.Domain;

public sealed class UserVerification
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int VerificationTypeId { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTime Timestamp { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public VerificationType VerificationType { get; private set; } = null!;

    private UserVerification() { }

    public static UserVerification Create(Guid userId, int verificationTypeId)
    {
        return new UserVerification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VerificationTypeId = verificationTypeId,
            IsVerified = false,
            Timestamp = DateTime.UtcNow
        };
    }
}
