namespace cohabit.application.Domain;

public sealed class Conversation
{
    public Guid Id { get; private set; }
    public Guid ListingId { get; private set; }
    public Guid OwnerUserId { get; private set; }
    public Guid TenantUserId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation
    public Listing Listing { get; private set; } = null!;
    public User Owner { get; private set; } = null!;
    public User Tenant { get; private set; } = null!;
    public ICollection<Message> Messages { get; private set; } = [];

    private Conversation() { }

    public static Conversation Create(Guid listingId, Guid ownerUserId, Guid tenantUserId)
    {
        return new Conversation
        {
            Id = Guid.NewGuid(),
            ListingId = listingId,
            OwnerUserId = ownerUserId,
            TenantUserId = tenantUserId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
