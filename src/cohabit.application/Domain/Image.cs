namespace cohabit.application.Domain;

public sealed class Image
{
    public Guid Id { get; private set; }
    public Guid ListingId { get; private set; }
    public string Url { get; private set; }
    public DateOnly Timestamp { get; private set; }

    // Navigation
    public Listing Listing { get; private set; } = null!;

    private Image() { }

    public static Image Create(Guid listingId, string url)
    {
        return new Image
        {
            Id = Guid.NewGuid(),
            ListingId = listingId,
            Url = url,
            Timestamp = DateOnly.FromDateTime(DateTime.UtcNow)
        };
    }
}
