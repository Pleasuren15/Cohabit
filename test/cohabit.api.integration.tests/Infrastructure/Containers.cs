using Testcontainers.Azurite;
using Testcontainers.PostgreSql;

namespace cohabit.api.integration.tests.Infrastructure;

public static class Containers
{
    private const int AzuriteBlobPort = 10000;
    private const string AzuriteAccountKey =
        "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";

    public static PostgreSqlContainer Postgres { get; private set; } = null!;
    public static AzuriteContainer Azurite { get; private set; } = null!;
    public static string AzuriteBlobConnectionString { get; private set; } = null!;

    public static async Task StartAsync()
    {
        Postgres = new PostgreSqlBuilder("postgres:16")
            .WithDatabase("cohabit")
            .WithUsername("cohabit")
            .WithPassword("cohabit")
            .Build();
        await Postgres.StartAsync();

        Azurite = new AzuriteBuilder("mcr.microsoft.com/azure-storage/azurite:latest")
            .WithCommand("--skipApiVersionCheck")
            .Build();
        await Azurite.StartAsync();

        var blobPort = Azurite.GetMappedPublicPort(AzuriteBlobPort);
        AzuriteBlobConnectionString =
            $"DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey={AzuriteAccountKey};" +
            $"BlobEndpoint=http://127.0.0.1:{blobPort}/devstoreaccount1;";
    }

    public static async Task DisposeAsync()
    {
        if (Azurite is not null)
            await Azurite.DisposeAsync();

        if (Postgres is not null)
            await Postgres.DisposeAsync();
    }
}
