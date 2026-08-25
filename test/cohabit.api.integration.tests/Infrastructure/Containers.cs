using DotNet.Testcontainers.Builders;
using Testcontainers.Azurite;
using Testcontainers.LocalStack;
using Testcontainers.PostgreSql;

namespace cohabit.api.integration.tests.Infrastructure;

public static class Containers
{
    private const int AzuriteBlobPort = 10000;
    private const string AzuriteAccountKey =
        "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";

    private const string LocalStackImage = "localstack/localstack:4.4.0";
    private const int LocalStackServicePort = 4566;

    public static PostgreSqlContainer Postgres { get; private set; } = null!;
    public static AzuriteContainer Azurite { get; private set; } = null!;
    public static LocalStackContainer LocalStack { get; private set; } = null!;
    public static string AzuriteBlobConnectionString { get; private set; } = null!;
    /// <summary>HTTP endpoint of the LocalStack S3 API (mirrors the AppHost wiring).</summary>
    public static string LocalStackS3ServiceUrl { get; private set; } = null!;

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

        // Same pinned image as the Aspire AppHost: releases after 4.4.0 demand
        // an auth token at startup, which breaks unattended container runs.
        LocalStack = new LocalStackBuilder(LocalStackImage)
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilHttpRequestIsSucceeded(r => r
                    .ForPath("/_localstack/health")
                    .ForPort(LocalStackServicePort)))
            .Build();
        await LocalStack.StartAsync();

        var blobPort = Azurite.GetMappedPublicPort(AzuriteBlobPort);
        AzuriteBlobConnectionString =
            $"DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey={AzuriteAccountKey};" +
            $"BlobEndpoint=http://127.0.0.1:{blobPort}/devstoreaccount1;";

        LocalStackS3ServiceUrl = new UriBuilder(
            "http", LocalStack.Hostname, LocalStack.GetMappedPublicPort(LocalStackServicePort)).Uri.AbsoluteUri;
    }

    public static async Task DisposeAsync()
    {
        if (LocalStack is not null)
            await LocalStack.DisposeAsync();

        if (Azurite is not null)
            await Azurite.DisposeAsync();

        if (Postgres is not null)
            await Postgres.DisposeAsync();
    }
}
