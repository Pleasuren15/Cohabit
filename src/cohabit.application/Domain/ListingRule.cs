namespace cohabit.application.Domain;

public sealed class ListingRule
{
    public Guid Id { get; private set; }
    public Guid ListingId { get; private set; }
    public int RuleId { get; private set; }

    // Navigation
    public Listing Listing { get; private set; } = null!;
    public Rule Rule { get; private set; } = null!;

    private ListingRule() { }

    public static ListingRule Create(Guid listingId, int ruleId)
    {
        return new ListingRule
        {
            Id = Guid.NewGuid(),
            ListingId = listingId,
            RuleId = ruleId
        };
    }
}
