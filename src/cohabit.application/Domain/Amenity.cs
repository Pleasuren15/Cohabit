namespace cohabit.application.Domain;

public sealed class Amenity
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    // Navigation
    public ICollection<ListingAmenity> ListingAmenities { get; private set; } = [];

    private Amenity() { }

    public static Amenity Create(string name)
    {
        return new Amenity
        {
            Name = name
        };
    }
}
