namespace cohabit.application.Domain;

public sealed class User
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string? Cellphone { get; private set; }
    public string? Email { get; private set; }
    public DateOnly DateOfBirth { get; private set; }
    public char Gender { get; private set; }
    public string? Bio { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsOtpVerified { get; private set; }
    public DateTime Timestamp { get; private set; }
    public Guid? AddressId { get; private set; }

    // Navigation
    public Address? Address { get; private set; }
    public ICollection<Listing> Listings { get; private set; } = [];
    public ICollection<WatchList> WatchLists { get; private set; } = [];
    public ICollection<UserVerification> UserVerifications { get; private set; } = [];
    public ICollection<Conversation> OwnerConversations { get; private set; } = [];
    public ICollection<Conversation> TenantConversations { get; private set; } = [];
    public ICollection<Message> SentMessages { get; private set; } = [];

    private User() { }

    public static User Create(
        string firstName,
        string lastName,
        string cellphone,
        string email,
        DateOnly dateOfBirth,
        char gender,
        string? bio,
        Guid addressId,
        Guid? id = null)
    {
        return new User
        {
            Id = id ?? Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Cellphone = cellphone,
            Email = email,
            DateOfBirth = dateOfBirth,
            Gender = gender,
            Bio = bio,
            IsOtpVerified = false,
            Timestamp = DateTime.UtcNow,
            AddressId = addressId
        };
    }

    public static User CreateFromJwt(
        Guid id,
        string firstName,
        string lastName,
        DateOnly? dateOfBirth,
        char gender,
        string? email,
        string? cellphone,
        string? avatarUrl)
    {
        return new User
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Cellphone = cellphone,
            DateOfBirth = dateOfBirth ?? new DateOnly(2000, 1, 1),
            Gender = gender,
            AvatarUrl = avatarUrl,
            IsOtpVerified = false,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    ///     Refreshes the profile fields from an authenticated JWT on subsequent
    ///     logins. Only non-empty values are applied, so a token with sparse
    ///     metadata never wipes existing profile data. Gender is only updated
    ///     when the token carries an explicit 'M' or 'F' value.
    /// </summary>
    public void UpdateFromJwt(
        string? firstName,
        string? lastName,
        DateOnly? dateOfBirth,
        char gender,
        string? email,
        string? cellphone,
        string? avatarUrl)
    {
        if (!string.IsNullOrWhiteSpace(firstName)) FirstName = firstName.Trim();
        if (!string.IsNullOrWhiteSpace(lastName)) LastName = lastName.Trim();
        if (dateOfBirth is not null) DateOfBirth = dateOfBirth.Value;
        if (gender is 'M' or 'F') Gender = gender;
        if (!string.IsNullOrWhiteSpace(email)) Email = email.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(cellphone)) Cellphone = cellphone.Trim();
        if (!string.IsNullOrWhiteSpace(avatarUrl)) AvatarUrl = avatarUrl;
    }

    public void Update(
        string firstName,
        string lastName,
        string cellphone,
        string email,
        DateOnly dateOfBirth,
        char gender,
        string? bio,
        Guid addressId)
    {
        FirstName = firstName;
        LastName = lastName;
        Cellphone = cellphone;
        Email = email;
        DateOfBirth = dateOfBirth;
        Gender = gender;
        Bio = bio;
        AddressId = addressId;
    }
}
