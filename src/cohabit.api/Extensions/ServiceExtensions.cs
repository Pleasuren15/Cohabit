using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.application.Data;
using cohabit.application.Data.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Hosting;
using Resend;

namespace cohabit.api.Extensions;

public static class ServiceExtensions
{
    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
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

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwt = builder.Configuration.GetSection("Jwt");
                var authority = jwt["Authority"];
                var signingKey = jwt["SigningKey"];
                var useAuthority = !string.IsNullOrWhiteSpace(authority);
                var useSymmetric = !string.IsNullOrWhiteSpace(signingKey);

                options.MapInboundClaims = false;
                if (useAuthority)
                    options.Authority = authority;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Supabase email/password access tokens carry `iss: "supabase"` even though the
                    // OIDC discovery issuer is the auth URL. When validating against Supabase's JWKS
                    // the ES256 signature is the source of trust, so issuer is not enforced there.
                    ValidateIssuer = !useAuthority && !string.IsNullOrWhiteSpace(jwt["Issuer"]),
                    ValidIssuer = jwt["Issuer"],
                    ValidateAudience = !string.IsNullOrWhiteSpace(jwt["Audience"]),
                    ValidAudience = jwt["Audience"],
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = useSymmetric,
                    IssuerSigningKey = useSymmetric
                        ? new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey!))
                        : null,
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });
        builder.Services.AddAuthorization();

        builder.Services.AddMemoryCache();
        builder.Services.AddScoped<ICache, InMemoryCache>();

        // Browser clients (the Vite dev server / Aspire-hosted web app on :5173) call
        // the API cross-origin. In Development allow the local web origins; in other
        // environments require an explicit allow-list via Cors:AllowedOrigins.
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                var allowedOrigins = builder.Environment.IsDevelopment()
                    ? ["http://localhost:5173", "http://127.0.0.1:5173"]
                    : builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

                if (allowedOrigins.Length > 0)
                    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
            });
        });

        builder.Services.AddScoped<IListingAccessor, ListingAccessor>();
        builder.Services.AddScoped<IProvinceAccessor, ProvinceAccessor>();
        builder.Services.AddScoped<IUserAccessor, UserAccessor>();
        builder.Services.AddScoped<IAddressAccessor, AddressAccessor>();
        builder.Services.AddScoped<IWatchListAccessor, WatchListAccessor>();
        builder.Services.AddScoped<IMessagingAccessor, MessagingAccessor>();
        builder.Services.AddScoped<IListingService, ListingService>();
        builder.Services.AddScoped<IProvinceService, ProvinceService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<IAddressService, AddressService>();
        builder.Services.AddScoped<IWatchListService, WatchListService>();
        builder.Services.AddScoped<ISystemMessagingService, SystemMessagingService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IReportService, ReportService>();
        builder.Services.AddScoped<IReportEmailSender, ResendReportEmailSender>();
        builder.Services.Configure<ReportOptions>(builder.Configuration.GetSection(ReportOptions.SectionName));
        builder.Services.AddResend(options =>
            options.ApiToken = builder.Configuration["Resend:ApiKey"] ?? string.Empty);

        builder.Services.AddScoped<ILookupSeeder, ProvinceSeeder>();
        builder.Services.AddScoped<ILookupSeeder, ListingTypeSeeder>();
        builder.Services.AddScoped<ILookupSeeder, AmenitySeeder>();
        builder.Services.AddScoped<ILookupSeeder, RuleSeeder>();
        builder.Services.AddScoped<ILookupSeeder, VerificationTypeSeeder>();
        builder.Services.AddScoped<ILookupSeeder, DemoDataSeeder>();
        builder.Services.AddScoped<LookupSeedManager>();

        builder.AddNpgsqlDbContext<CohabitDbContext>("cohabit-db");
        builder.AddAzureBlobServiceClient("cohabit-images");

        builder.Services.AddSingleton<IImageStorage, BlobImageStorage>();

        return builder;
    }
}
