var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithHostPort(5432)
    .WithDataVolume("cohabit-postgres-data");
var cohabitDb = postgres.AddDatabase("cohabit-db");

var storage = builder.AddAzureStorage("cohabit-storage")
    .RunAsEmulator(container => container
        .WithDataVolume("cohabit-storage-data"));
var imagesBlob = storage.AddBlobs("cohabit-images");

// Two object stores run side by side:
//   - Azure Blob (Azurite)  -> public listing images
//   - LocalStack (S3 emu)   -> private ID verification documents (cohabit-id-documents)
// Pinned to 4.4.0: the last release before LocalStack's March 2026 licensing
// change made localstack/localstack:latest require an auth token (exit code 55).
var localStack = builder.AddContainer("localstack", "localstack/localstack", "4.4.0")
    .WithHttpEndpoint(targetPort: 4566)
    .WithHttpHealthCheck("/_localstack/health")
    .WithVolume("cohabit-localstack-data", "/var/lib/localstack")
    .WithEnvironment("PERSISTENCE", "1");

// Startup order enforced with WaitFor + health checks:
//   postgres -> cohabit-db -> (azurite, localstack) -> cohabit-api /health
//   cohabit-db -> comms-api /health
//   cohabit-api /health -> cohabit-web
//   cohabit-api /health -> cohabit-management-web
// cohabit-api's /health only answers after migrations + store bootstrap finish,
// so dependents never start against a half-initialised API.
var cohabitApi = builder.AddProject<Projects.cohabit_api>("cohabit-api")
    .WithHttpEndpoint(port: 5001, name: "http")
    .WithHttpHealthCheck("/health")
    .WithReference(cohabitDb)
    .WithReference(imagesBlob)
    .WithEnvironment("S3__ServiceUrl", localStack.GetEndpoint("http"))
    .WithEnvironment("S3__Region", "us-east-1")
    .WithEnvironment("S3__AccessKey", "test")
    .WithEnvironment("S3__SecretKey", "test")
    .WithEnvironment("S3__BucketName", "cohabit-id-documents")
    .WaitFor(cohabitDb)
    .WaitFor(imagesBlob)
    .WaitFor(localStack);

var commsApi = builder.AddProject<Projects.cohabit_comms_api>("comms-api")
    .WithHttpEndpoint(port: 5002, name: "http")
    .WithHttpHealthCheck("/health")
    .WithReference(cohabitDb)
    .WaitFor(cohabitDb);

var cohabitWeb = builder.AddExecutable(
        name: "cohabit-web",
        command: "npm",
        workingDirectory: "../../cohabit.web",
        args: ["run", "dev"])
    .WithHttpEndpoint(port: 5173, name: "http", env: "PORT")
    .WithEnvironment("VITE_API_URL", cohabitApi.GetEndpoint("http"))
    .WithReference(cohabitApi)
    .WaitFor(cohabitApi);

var managementWeb = builder.AddExecutable(
        name: "cohabit-management-web",
        command: "npm",
        workingDirectory: "../../cohabit.management.web",
        args: ["run", "dev"])
    .WithHttpEndpoint(port: 5174, name: "http", env: "PORT")
    .WithEnvironment("VITE_API_URL", cohabitApi.GetEndpoint("http"))
    .WithReference(cohabitApi)
    .WaitFor(cohabitApi);

builder.Build().Run();
