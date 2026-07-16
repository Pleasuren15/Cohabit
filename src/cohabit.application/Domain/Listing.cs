namespace cohabit.application.Domain;

public sealed class Listing
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid AddressId { get; private set; }
    public string Description { get; private set; }
    public string Type { get; private set; }
    public DateTime Timestamp { get; private set; }
    public DateTime Expires { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public Address Address { get; private set; } = null!;
    public ICollection<Image> Images { get; private set; } = [];
    public ICollection<WatchList> WatchLists { get; private set; } = [];

    private Listing() { }

    public static Listing Create(
        Guid userId,
        Guid addressId,
        string description,
        string type,
        DateTime expires)
    {
        return new Listing
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AddressId = addressId,
            Description = description,
            Type = type,
            Timestamp = DateTime.UtcNow,
            Expires = expires
        };
    }
}
