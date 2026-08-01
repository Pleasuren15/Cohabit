namespace cohabit.application.Domain;

public sealed class ListingType
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    // Navigation
    public ICollection<Listing> Listings { get; private set; } = [];

    private ListingType() { }

    public static ListingType Create(string name)
    {
        return new ListingType
        {
            Name = name
        };
    }
}
