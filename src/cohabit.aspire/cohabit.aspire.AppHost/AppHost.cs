var builder = DistributedApplication.CreateBuilder(args);

var storage = builder.AddAzureStorage("storage")
    .RunAsEmulator();

var files = storage.AddBlobs("files");

var postgres = builder.AddPostgres("postgres");
var cohabitDb = postgres.AddDatabase("cohabit-db");

var cohabitApi = builder.AddProject<Projects.cohabit_api>("cohabit-api")
    .WithHttpEndpoint(port: 5001, name: "http")
    .WithReference(files)
    .WithReference(cohabitDb);

var verificationApi = builder.AddProject<Projects.cohabit_verification_api>("verification-api")
    .WithHttpEndpoint(port: 5002, name: "http")
    .WithReference(cohabitDb);

builder.Build().Run();
