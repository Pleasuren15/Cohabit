using cohabit.api.Services;
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
        builder.UseSetting("S3:ServiceUrl", Containers.LocalStackS3ServiceUrl);

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:cohabit-db"] = Containers.Postgres.GetConnectionString(),
                ["ConnectionStrings:cohabit-images"] = Containers.AzuriteBlobConnectionString,
                ["Jwt:SigningKey"] = TestJwt.SigningKey,
                ["Jwt:Issuer"] = TestJwt.Issuer,
                ["Jwt:Audience"] = TestJwt.Audience,
                ["Jwt:Authority"] = "",
                // Mirrors the S3__* env vars injected by the Aspire AppHost.
                ["S3:ServiceUrl"] = Containers.LocalStackS3ServiceUrl,
                ["S3:Region"] = "us-east-1",
                ["S3:AccessKey"] = "test",
                ["S3:SecretKey"] = "test",
                ["S3:BucketName"] = "cohabit-id-documents"
            });
        });

        builder.ConfigureServices(services =>
            services.AddScoped<IReportEmailSender, CapturingReportEmailSender>());
    }

    public void ClearCache()
    {
        using var scope = Services.CreateScope();
        var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();
        (cache as MemoryCache)?.Compact(1.0);
    }
}
