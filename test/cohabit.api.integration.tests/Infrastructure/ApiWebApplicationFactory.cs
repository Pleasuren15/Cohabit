using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Memory;
using Microsoft.Extensions.DependencyInjection;

namespace cohabit.api.integration.tests.Infrastructure;

public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:cohabit-db", Containers.Postgres.GetConnectionString());
        builder.UseSetting("ConnectionStrings:cohabit-images", Containers.AzuriteBlobConnectionString);

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:cohabit-db"] = Containers.Postgres.GetConnectionString(),
                ["ConnectionStrings:cohabit-images"] = Containers.AzuriteBlobConnectionString
            });
        });
    }

    public void ClearCache()
    {
        using var scope = Services.CreateScope();
        var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();
        (cache as MemoryCache)?.Compact(1.0);
    }
}
