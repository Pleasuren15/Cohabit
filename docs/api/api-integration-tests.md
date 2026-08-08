---
name: api-integration-test-workflow
description: "Use when you need to create integration tests for an ASP.NET Core API by booting the real application against Testcontainers-backed infrastructure, stubbing external APIs with WireMock, and writing Given_When_Then tests with Arrange/Act/Assert sections and AwesomeAssertions. Each test file maps to a controller."
---

# API Integration Test Workflow

Use this guide when adding or extending integration tests for the APIs in this repository (`cohabit.api`, `comms.api`).

Integration tests exercise the full HTTP stack — routing, model binding, filters, JSON serialization, the real `CohabitDbContext`, and real service/accessor wiring — so they are the closest we get to verifying production behaviour without deploying.

## Goal

Create a reliable integration test suite that:

- boots the real application with `WebApplicationFactory`,
- runs real infrastructure (PostgreSQL, Azurite blob storage) via **TestContainers**,
- stubs external APIs (e.g. the comms SMS provider) with **WireMock**,
- names every test with **Given_When_Then** syntax,
- structures each test with `// Arrange`, `// Act`, `// Assert` sections,
- asserts with **AwesomeAssertions**,
- organises test cases, helpers, and infrastructure into their own folders,
- maps each test file to the controller it exercises.

## Project layout

Each API has its own integration test project under `test/`:

```
test/cohabit.api.integration.tests/
  Infrastructure/          # Testcontainers + WebApplicationFactory plumbing
    PostgresContainer.cs
    AzuriteContainer.cs
    IntegrationTestFixture.cs
    ApiWebApplicationFactory.cs
  Helpers/                 # Reusable factories, builders, assertions helpers
    TestDataFactory.cs
    HttpClientExtensions.cs
    TestSeeder.cs
  TestCases/               # One file per controller
    ProvincesControllerTests.cs
    ListingsControllerTests.cs
    UsersControllerTests.cs
    ...

test/comms.api.integration.tests/
  Infrastructure/
    PostgresContainer.cs
    WireMockServer.cs      # Stands in for the SMS Portal external API
    IntegrationTestFixture.cs
    CommsWebApplicationFactory.cs
  Helpers/
    SmsPortalStubBuilder.cs
    HttpClientExtensions.cs
  TestCases/
    OtpRequestIntegrationTests.cs
```

- **`Infrastructure/`** — everything needed to boot and host the app under test: containers, the fixture, the factory. Nothing test-case specific lives here.
- **`Helpers/`** — shared test utilities: factories that build entities/DTOs, HTTP helpers, seeding helpers, WireMock stub builders. Pure code, no container/fixture concerns.
- **`TestCases/`** — one file per controller/endpoint group. Test cases only; no infrastructure or helper logic.

## Naming: Given_When_Then

Name every test with the `Given_<State>_When_<Action>_Then_<ExpectedOutcome>` pattern:

```
Given_SeededProvinces_When_GetAllIsInvoked_Then_ReturnsOkResultWithAllProvinces()
Given_UnknownListingId_When_GetByIdIsInvoked_Then_ReturnsNotFound()
Given_WireMockReturnsError_When_RequestOtpIsInvoked_Then_ReturnsBadGateway()
```

Rules:

- `Given_` describes the precondition/state (data seeded, external stub configured, auth token present).
- `When_` describes the HTTP action being taken (`GET /api/provinces`, `POST /api/otp/request`).
- `Then_` describes the observable outcome (status code, body shape, side effect).
- One behaviour per test. If a test needs more than one `Then_`, split it.

## Test body: Arrange / Act / Assert

Every test has exactly three labelled sections, in order:

```csharp
[Test]
public async Task Given_SeededProvinces_When_GetAllIsInvoked_Then_ReturnsAllProvinces()
{
    // Arrange
    var client = await fixture.CreateClientAsync();
    await seed.SeedProvincesAsync();

    // Act
    var response = await client.GetAsync("/api/provinces");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var provinces = await response.ReadAsAsync<List<ProvinceDto>>();
    provinces.Select(p => p.Name).Should().BeEquivalentTo(["Western Cape", "Gauteng"]);
}
```

- `// Arrange` — set up state: seed data, configure WireMock stubs, create/reset the client.
- `// Act` — exactly one invocation of the system under test (one HTTP call).
- `// Assert` — verify with AwesomeAssertions.

For tests that assert on an exception-free call and its result, `// Act` stays a single call. Do not fold multiple HTTP calls into one `// Act`; if the scenario requires multiple calls (e.g. create then read), treat the first call as part of `// Arrange`.

## Assertions: AwesomeAssertions

Use AwesomeAssertions (`AwesomeAssertions` NuGet package) in every `// Assert`. Never use NUnit's `Assert.*`.

```csharp
response.StatusCode.Should().Be(HttpStatusCode.OK);
result.Items.Should().ContainSingle();
result.TotalCount.Should().Be(2);
created.Id.Should().NotBeEmpty();
payload.Should().BeEquivalentTo(expected);
await act.Should().ThrowAsync<ApiException>();
```

Use `using AwesomeAssertions;` at the top of every test file (or via a shared `GlobalUsings`).

## Test file to controller mapping

Each file in `TestCases/` targets exactly one controller or endpoint group and is named `{ControllerName}Tests.cs`:

| Test file | Target |
|-----------|--------|
| `TestCases/ProvincesControllerTests.cs` | `cohabit.api.Controllers.ProvincesController` |
| `TestCases/ListingsControllerTests.cs` | `cohabit.api.Controllers.ListingsController` |
| `TestCases/UsersControllerTests.cs` | `cohabit.api.Controllers.UsersController` |
| `TestCases/OtpRequestIntegrationTests.cs` | `cohabit.comms.api` OTP endpoints |

A test file only calls the HTTP routes owned by its controller. Test all routes of that controller in one file.

## Infrastructure: TestContainers

Real dependencies run inside containers via **TestContainers** (`Testcontainers` NuGet package). Add the modules you need:

- `Testcontainers.PostgreSql` — for the `cohabit.api` database.
- `Testcontainers.Azurite` — for Azure blob storage (listing images) if the tests upload/download images.

### Container lifecycle

Containers are started once per test session and shared across tests. Use a `[SetUpFixture]`-style fixture (NUnit) or a fixture base class with `OneTimeSetUp`/`OneTimeTearDown`:

```csharp
[SetUpFixture]
public sealed class IntegrationTestFixture
{
    public static PostgresContainer Postgres { get; private set; } = null!;
    public static AzuriteContainer Azurite { get; private set; } = null!;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        Postgres = new PostgresBuilder()
            .WithImage("postgres:16")
            .WithDatabase("cohabit")
            .WithUsername("cohabit")
            .WithPassword("cohabit")
            .Build();
        await Postgres.StartAsync();

        Azurite = new AzuriteBuilder()
            .WithImage("mcr.microsoft.com/azure-storage/azurite:latest")
            .Build();
        await Azurite.StartAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        await Postgres.DisposeAsync();
        await Azurite.DisposeAsync();
    }
}
```

### Application under test

Boot the real app with a `WebApplicationFactory`, overriding the connection strings to point at the running containers:

```csharp
public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:cohabit-db"] = Postgres.GetConnectionString(),
                ["ConnectionStrings:cohabit-images"] = Azurite.GetConnectionString()
            });
        });
    }
}
```

Because the API runs `MigrateAsync()` and seeds lookups at startup (`src/cohabit.api/Program.cs`), the container database is migrated and lookup data is seeded automatically the first time the factory starts. Each test should reset the database to a known state in `[SetUp]` (delete rows, then seed what the test needs) rather than assuming a shared state.

### Working with a fresh database per test

Keep tests independent. A simple pattern is to truncate all tables in `[SetUp]` and let each test seed only what it needs:

```csharp
[SetUp]
public async Task SetUp()
{
    await factory.ResetDatabaseAsync();
}
```

## Infrastructure: WireMock for external APIs

Any external API the app calls (e.g. the SMS Portal provider in `comms.api`) is stubbed with **WireMock.Net** (`WireMock.Net` NuGet package). Do not hit real third-party services.

Start a WireMock server alongside the app and point the external API base URL at it:

```csharp
public sealed class WireMockServer : IAsyncDisposable
{
    public WireMockServer Server { get; } = WireMockServer.Start();

    public async ValueTask DisposeAsync() => await Task.Run(Server.Dispose);
}
```

Register the stub server's address in the app configuration so the SMS Portal `RestClient` targets it instead of the real provider:

```csharp
builder.ConfigureAppConfiguration((_, config) =>
{
    config.AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["SmsPortal:BaseUrl"] = wireMock.Server.Url!
    });
});
```

Stub the upstream responses in the test's `// Arrange`:

```csharp
// Arrange
wireMock.Server.Given(Request.Create().WithPath("/BulkMessages").UsingPost())
    .RespondWith(Response.Create()
        .WithStatusCode(200));
```

Keep WireMock stub builders in `Helpers/` (e.g. `SmsPortalStubBuilder`) so the JSON payloads and route conventions live in one place:

```csharp
public static class SmsPortalStubBuilder
{
    public static void RespondWithSuccess(WireMockServer server) { /* ... */ }
    public static void RespondWithError(WireMockServer server, int statusCode) { /* ... */ }
}
```

## Required workflow

1. **Map the controller to a test file**
   - Determine which controller/endpoint group the route belongs to.
   - Open or create `TestCases/{ControllerName}Tests.cs`.

2. **Identify the real dependencies the route touches**
   - Database tables (`CohabitDbContext` via the Postgres container).
   - Blob storage (`BlobImageStorage` via the Azurite container).
   - External APIs (the SMS Portal `RestClient` via WireMock).

3. **Configure the container/fixture**
   - Ensure the needed container is started in the fixture.
   - Override the connection strings / external base URLs in the `WebApplicationFactory`.

4. **Set up the test state**
   - In `// Arrange`, reset the database to a known baseline, seed entities the route needs, and configure WireMock stubs.

5. **Write the test case**
   - Name it with `Given_When_Then`.
   - Structure the body with `// Arrange`, `// Act`, `// Assert`.
   - Make a single HTTP call in `// Act`.

6. **Assert with AwesomeAssertions**
   - Verify status codes, response DTO shapes, and side effects (DB rows, WireMock request logs).

## Quality checklist

Before considering the work complete, verify:

- [ ] Test file is in `TestCases/` and named after its controller.
- [ ] Every test name uses `Given_When_Then` syntax.
- [ ] Every test contains `// Arrange`, `// Act`, `// Assert` sections in order.
- [ ] Assertions use AwesomeAssertions (`Should()`), never NUnit `Assert.*`.
- [ ] Infrastructure (containers, fixture, factory) lives only in `Infrastructure/`.
- [ ] Shared test utilities live only in `Helpers/`.
- [ ] Tests run against Testcontainers-backed infrastructure, not a local dev database.
- [ ] External APIs are stubbed with WireMock, never called for real.
- [ ] Tests are independent — each seeds its own state and does not rely on other tests' data.
- [ ] The project has package references for Testcontainers, WireMock.Net, AwesomeAssertions, and `Microsoft.AspNetCore.Mvc.Testing`.

## Package references to add

To the integration test `.csproj`:

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.0.*" />
    <PackageReference Include="AwesomeAssertions" Version="9.5.0" />
    <PackageReference Include="Testcontainers" Version="4.*" />
    <PackageReference Include="Testcontainers.PostgreSql" Version="4.*" />
    <PackageReference Include="Testcontainers.Azurite" Version="4.*" />
    <PackageReference Include="WireMock.Net" Version="1.*" />
</ItemGroup>

<ItemGroup>
    <ProjectReference Include="..\..\src\cohabit.api\cohabit.api.csproj" />
</ItemGroup>
```

Use `Microsoft.AspNetCore.Mvc.Testing`'s `WebApplicationFactory<T>` where `T` is the `Program` class of the API under test.

## Example prompt to trigger this workflow

- "Create integration tests for the ProvincesController using the api-integration-test-workflow."
- "Add an integration test that boots the app with Testcontainers and stubs the SMS Portal API with WireMock."
