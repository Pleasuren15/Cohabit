namespace cohabit.application.Domain;

public sealed class Address
{
    public Guid Id { get; private set; }
    public string AddressLine1 { get; private set; }
    public string AddressLine2 { get; private set; }
    public string PostalCode { get; private set; }
    public string Province { get; private set; }

    // Navigation
    public ICollection<User> Users { get; private set; } = [];
    public ICollection<Listing> Listings { get; private set; } = [];

    private Address() { }

    public static Address Create(
        string addressLine1,
        string addressLine2,
        string postalCode,
        string province)
    {
        return new Address
        {
            Id = Guid.NewGuid(),
            AddressLine1 = addressLine1,
            AddressLine2 = addressLine2,
            PostalCode = postalCode,
            Province = province
        };
    }
}
