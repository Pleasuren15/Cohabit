namespace cohabit.application.Domain;

public sealed class Listing
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid AddressId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public int TypeId { get; private set; }
    public int Price { get; private set; }
    public int Deposit { get; private set; }
    public int Beds { get; private set; }
    public int Baths { get; private set; }
    public DateOnly AvailableFrom { get; private set; }
    public string ResponseTime { get; private set; }
    public DateTime Timestamp { get; private set; }
    public DateTime Expires { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public Address Address { get; private set; } = null!;
    public ListingType Type { get; private set; } = null!;
    public ICollection<Image> Images { get; private set; } = [];
    public ICollection<WatchList> WatchLists { get; private set; } = [];
    public ICollection<ListingAmenity> ListingAmenities { get; private set; } = [];
    public ICollection<ListingRule> ListingRules { get; private set; } = [];
    public ICollection<Conversation> Conversations { get; private set; } = [];

    private Listing() { }

    public static Listing Create(
        Guid userId,
        Guid addressId,
        string title,
        string description,
        int typeId,
        int price,
        int deposit,
        int beds,
        int baths,
        DateOnly availableFrom,
        string responseTime,
        DateTime expires)
    {
        return new Listing
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AddressId = addressId,
            Title = title,
            Description = description,
            TypeId = typeId,
            Price = price,
            Deposit = deposit,
            Beds = beds,
            Baths = baths,
            AvailableFrom = availableFrom,
            ResponseTime = responseTime,
            Timestamp = DateTime.UtcNow,
            Expires = expires
        };
    }

    public void Update(
        string title,
        string description,
        int typeId,
        int price,
        int deposit,
        int beds,
        int baths,
        DateOnly availableFrom,
        string responseTime)
    {
        Title = title;
        Description = description;
        TypeId = typeId;
        Price = price;
        Deposit = deposit;
        Beds = beds;
        Baths = baths;
        AvailableFrom = availableFrom;
        ResponseTime = responseTime;
    }
}
