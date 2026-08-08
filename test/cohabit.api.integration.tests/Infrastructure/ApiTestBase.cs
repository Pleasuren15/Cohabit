using cohabit.api.integration.tests.Helpers;

namespace cohabit.api.integration.tests.Infrastructure;

public abstract class ApiTestBase
{
    protected HttpClient Client { get; private set; } = null!;
    protected TestDataFactory Data { get; private set; } = null!;

    [SetUp]
    public async Task SetUp()
    {
        var factory = IntegrationTestFixture.Factory;
        factory.ClearCache();
        await DatabaseReset.TruncateAsync();

        Client = factory.CreateClient();
        Data = new TestDataFactory(TestDbContext.Create());
    }

    [TearDown]
    public void TearDown()
    {
        Data.Dispose();
        Client.Dispose();
    }
}
