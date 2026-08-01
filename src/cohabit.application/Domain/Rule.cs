namespace cohabit.application.Domain;

public sealed class Rule
{
    public int Id { get; private set; }
    public string Name { get; private set; }

    // Navigation
    public ICollection<ListingRule> ListingRules { get; private set; } = [];

    private Rule() { }

    public static Rule Create(string name)
    {
        return new Rule
        {
            Name = name
        };
    }
}
