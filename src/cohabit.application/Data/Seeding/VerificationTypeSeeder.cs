using cohabit.application.Domain;
using cohabit.application.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data.Seeding;

public sealed class VerificationTypeSeeder : LookupSeeder<VerificationType, VerificationTypeName>
{
    protected override DbSet<VerificationType> GetDbSet(CohabitDbContext dbContext) => dbContext.VerificationTypes;

    protected override string GetName(VerificationType entity) => entity.Name;

    protected override string GetDisplayName(VerificationTypeName value) => value.GetDescription();

    protected override VerificationType Create(VerificationTypeName value) => VerificationType.Create(value.GetDescription());
}
