using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using cohabit.api.Extensions;
using cohabit.api.Services;
using cohabit.application.Data;
using cohabit.application.Data.Seeding;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationServices();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CohabitDbContext>();
    await dbContext.Database.MigrateAsync();
    var seedManager = scope.ServiceProvider.GetRequiredService<LookupSeedManager>();
    await seedManager.SeedAsync(dbContext);

    var blobServiceClient = scope.ServiceProvider.GetService<BlobServiceClient>();
    if (blobServiceClient is not null)
    {
        var container = blobServiceClient.GetBlobContainerClient(BlobImageStorage.ContainerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.Blob);
        await container.SetAccessPolicyAsync(PublicAccessType.Blob);
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

app.Run();

public partial class Program { }
