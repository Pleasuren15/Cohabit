var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithHostPort(5432)
    .WithDataVolume("cohabit-postgres-data");
var cohabitDb = postgres.AddDatabase("cohabit-db");

var storage = builder.AddAzureStorage("cohabit-storage")
    .RunAsEmulator(container => container
        .WithDataVolume("cohabit-storage-data"));
var imagesBlob = storage.AddBlobs("cohabit-images");

var cohabitApi = builder.AddProject<Projects.cohabit_api>("cohabit-api")
    .WithHttpEndpoint(port: 5001, name: "http")
    .WithReference(cohabitDb)
    .WithReference(imagesBlob)
    .WaitFor(cohabitDb)
    .WaitFor(imagesBlob);

var verificationApi = builder.AddProject<Projects.cohabit_verification_api>("verification-api")
    .WithHttpEndpoint(port: 5002, name: "http")
    .WithReference(cohabitDb)
    .WaitFor(cohabitDb);

var cohabitWeb = builder.AddExecutable(
        name: "cohabit-web",
        command: "npm",
        workingDirectory: "../../cohabit.web",
        args: ["run", "dev", "--", "--port", "5173", "--strictPort"])
    .WithHttpEndpoint(port: 5173, name: "http")
    .WithEnvironment("VITE_API_URL", cohabitApi.GetEndpoint("http"))
    .WithReference(cohabitApi);

builder.Build().Run();
