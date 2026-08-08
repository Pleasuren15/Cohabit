using cohabit.api.integration.tests.Infrastructure;
using DotNet.Testcontainers.Configurations;

[SetUpFixture]
public sealed class IntegrationTestFixture
{
    public static ApiWebApplicationFactory Factory { get; private set; } = null!;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        TestcontainersSettings.ResourceReaperEnabled = false;
        await Containers.StartAsync();

        Factory = new ApiWebApplicationFactory();
        _ = Factory.Services;
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        Factory?.Dispose();
        await Containers.DisposeAsync();
    }
}
