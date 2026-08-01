using System.Text.Json.Serialization;
using cohabit.api.Services;
using cohabit.application.Data;
using cohabit.application.Data.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddAzureBlobServiceClient("files");

builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddScoped<IBlobService, BlobService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILookupSeeder, ProvinceSeeder>();
builder.Services.AddScoped<ILookupSeeder, ListingTypeSeeder>();
builder.Services.AddScoped<ILookupSeeder, AmenitySeeder>();
builder.Services.AddScoped<ILookupSeeder, RuleSeeder>();
builder.Services.AddScoped<ILookupSeeder, VerificationTypeSeeder>();
builder.Services.AddScoped<LookupSeedManager>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddAuthorization();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

app.Run();
