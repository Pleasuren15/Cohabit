using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class RuleSeeder : LookupSeeder<Rule, RuleName>
{
    protected override DbSet<Rule> GetDbSet(CohabitDbContext dbContext) => dbContext.Rules;

    protected override string GetName(Rule entity) => entity.Name;

    protected override string GetDisplayName(RuleName value) => value.GetDescription();

    protected override Rule Create(RuleName value) => Rule.Create(value.GetDescription());
}
