namespace cohabit.application.Domain;

public sealed class Province
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    // Navigation
    public ICollection<Address> Addresses { get; private set; } = [];

    private Province() { }

    public static Province Create(string name)
    {
        return new Province
        {
            Name = name
        };
    }
}
