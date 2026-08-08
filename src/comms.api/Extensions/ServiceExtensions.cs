using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using cohabit.comms.api.Features.Messaging.Sms;
using cohabit.comms.api.Features.Otp;
using cohabit.comms.api.Features.Otp.Dispatchers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Resend;
using RestSharp;

namespace cohabit.comms.api.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

        services.AddOpenApi();

        services.AddMemoryCache();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwt = configuration.GetSection("Jwt");
                var signingKey = jwt["SigningKey"];
                options.MapInboundClaims = false;
                options.Authority = string.IsNullOrWhiteSpace(jwt["Authority"]) ? null : jwt["Authority"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwt["Audience"],
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = !string.IsNullOrWhiteSpace(signingKey),
                    IssuerSigningKey = string.IsNullOrWhiteSpace(signingKey)
                        ? null
                        : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });
        services.AddAuthorization();

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, ct) =>
            {
                context.HttpContext.Response.ContentType = "application/problem+json";
                await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too many requests",
                    Detail = $"OTP requests are limited to {RateLimitPolicies.OtpRequestsPerWindow} per {RateLimitPolicies.OtpRequestWindow.TotalMinutes} minutes"
                }, ct);
            };

            options.AddPolicy(RateLimitPolicies.OtpRequest, context =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    RateLimitPartitionKey(context),
                    _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = RateLimitPolicies.OtpRequestsPerWindow,
                        Window = RateLimitPolicies.OtpRequestWindow,
                        SegmentsPerWindow = 3,
                        AutoReplenishment = true
                    }));
        });

        services.AddScoped<IOtpCodeStore, InMemoryOtpCodeStore>();
        services.AddScoped<IOtpCodeGenerator, RandomOtpCodeGenerator>();
        services.AddScoped<ISmsProvider, SmsPortalSmsProvider>();
        services.AddScoped<SmsMessageDispatcher>();
        services.AddScoped<EmailMessageDispatcher>();
        services.AddScoped<IOtpService, OtpService>();

        services.Configure<SmsPortalOptions>(configuration.GetSection(SmsPortalOptions.SectionName));
        services.AddSingleton(sp =>
            new RestClient(new RestClientOptions(
                sp.GetRequiredService<IOptions<SmsPortalOptions>>().Value.BaseUrl)));

        services.AddResend(options =>
            options.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty);
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));

        return services;
    }

    private static string RateLimitPartitionKey(HttpContext context)
    {
        var userId = context.User.FindFirstValue(JwtClaims.UserId);
        return string.IsNullOrWhiteSpace(userId)
            ? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous"
            : userId;
    }
}
