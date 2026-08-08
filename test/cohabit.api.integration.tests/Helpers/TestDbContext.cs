using cohabit.api.integration.tests.Infrastructure;
using cohabit.application.Data;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.integration.tests.Helpers;

public static class TestDbContext
{
    public static CohabitDbContext Create()
    {
        var options = new DbContextOptionsBuilder<CohabitDbContext>()
            .UseNpgsql(Containers.Postgres.GetConnectionString())
            .Options;
        return new CohabitDbContext(options);
    }
}
