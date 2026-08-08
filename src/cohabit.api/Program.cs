using System.Text.Json.Serialization;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.application.Data;
using cohabit.application.Data.Seeding;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new IntListJsonConverter());
    })
    .AddMvcOptions(options =>
    {
        options.Filters.Add<ApiExceptionFilter>();
        options.ModelBinderProviders.Insert(0, new IntListModelBinderProvider());
    });

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICache, InMemoryCache>();

builder.Services.AddScoped<IListingAccessor, ListingAccessor>();
builder.Services.AddScoped<IProvinceAccessor, ProvinceAccessor>();
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IAddressAccessor, AddressAccessor>();
builder.Services.AddScoped<IWatchListAccessor, WatchListAccessor>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IProvinceService, ProvinceService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<IWatchListService, WatchListService>();

builder.Services.AddScoped<ILookupSeeder, ProvinceSeeder>();
builder.Services.AddScoped<ILookupSeeder, ListingTypeSeeder>();
builder.Services.AddScoped<ILookupSeeder, AmenitySeeder>();
builder.Services.AddScoped<ILookupSeeder, RuleSeeder>();
builder.Services.AddScoped<ILookupSeeder, VerificationTypeSeeder>();
builder.Services.AddScoped<LookupSeedManager>();

builder.AddNpgsqlDbContext<CohabitDbContext>("cohabit-db");
builder.AddAzureBlobServiceClient("cohabit-images");

builder.Services.AddSingleton<IImageStorage, BlobImageStorage>();

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

app.MapControllers();

app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

app.Run();

public partial class Program { }
