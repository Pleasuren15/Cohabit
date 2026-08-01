using System.Text.Json.Serialization;
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
    })
    .AddMvcOptions(options =>
    {
        options.Filters.Add<ApiExceptionFilter>();
    });

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICache, InMemoryCache>();

builder.Services.AddScoped<IListingAccessor, ListingAccessor>();
builder.Services.AddScoped<IProvinceAccessor, ProvinceAccessor>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IProvinceService, ProvinceService>();

builder.Services.AddScoped<ILookupSeeder, ProvinceSeeder>();
builder.Services.AddScoped<ILookupSeeder, ListingTypeSeeder>();
builder.Services.AddScoped<ILookupSeeder, AmenitySeeder>();
builder.Services.AddScoped<ILookupSeeder, RuleSeeder>();
builder.Services.AddScoped<ILookupSeeder, VerificationTypeSeeder>();
builder.Services.AddScoped<LookupSeedManager>();

builder.AddNpgsqlDbContext<CohabitDbContext>("cohabit-db");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CohabitDbContext>();
    await dbContext.Database.MigrateAsync();
    var seedManager = scope.ServiceProvider.GetRequiredService<LookupSeedManager>();
    await seedManager.SeedAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapControllers();

app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

app.Run();
