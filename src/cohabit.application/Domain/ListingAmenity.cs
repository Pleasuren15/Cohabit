namespace cohabit.application.Domain;

public sealed class ListingAmenity
{
    public Guid Id { get; private set; }
    public Guid ListingId { get; private set; }
    public int AmenityId { get; private set; }

    // Navigation
    public Listing Listing { get; private set; } = null!;
    public Amenity Amenity { get; private set; } = null!;

    private ListingAmenity() { }

    public static ListingAmenity Create(Guid listingId, int amenityId)
    {
        return new ListingAmenity
        {
            Id = Guid.NewGuid(),
            ListingId = listingId,
            AmenityId = amenityId
        };
    }
}
