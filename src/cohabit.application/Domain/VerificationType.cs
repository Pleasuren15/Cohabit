namespace cohabit.application.Domain;

public sealed class VerificationType
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    // Navigation
    public ICollection<UserVerification> UserVerifications { get; private set; } = [];

    private VerificationType() { }

    public static VerificationType Create(string name)
    {
        return new VerificationType
        {
            Name = name
        };
    }
}
