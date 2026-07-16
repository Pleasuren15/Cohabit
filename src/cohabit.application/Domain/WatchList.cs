namespace cohabit.application.Domain;

public sealed class WatchList
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string ListingId { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public Listing Listing { get; private set; } = null!;

    private WatchList() { }

    public static WatchList Create(Guid userId, string listingId)
    {
        return new WatchList
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ListingId = listingId
        };
    }
}
