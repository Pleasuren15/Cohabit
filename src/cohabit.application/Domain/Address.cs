namespace cohabit.application.Domain;

public sealed class Address
{
    public Guid Id { get; private set; }
    public string AddressLine1 { get; private set; }
    public string AddressLine2 { get; private set; }
    public string Suburb { get; private set; }
    public string PostalCode { get; private set; }
    public int ProvinceId { get; private set; }

    // Navigation
    public Province Province { get; private set; } = null!;
    public ICollection<User> Users { get; private set; } = [];
    public ICollection<Listing> Listings { get; private set; } = [];

    private Address() { }

    public static Address Create(
        string addressLine1,
        string addressLine2,
        string suburb,
        string postalCode,
        int provinceId)
    {
        return new Address
        {
            Id = Guid.NewGuid(),
            AddressLine1 = addressLine1,
            AddressLine2 = addressLine2,
            Suburb = suburb,
            PostalCode = postalCode,
            ProvinceId = provinceId
        };
    }

    public void Update(
        string addressLine1,
        string addressLine2,
        string suburb,
        string postalCode,
        int provinceId)
    {
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        Suburb = suburb;
        PostalCode = postalCode;
        ProvinceId = provinceId;
    }
}
