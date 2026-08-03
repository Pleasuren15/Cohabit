using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Serialization;
using cohabit.comms.api.Features.BulkSms;
using cohabit.comms.api.Features.BulkSms.Infrastructure;
using cohabit.comms.api.Features.BulkSms.Messages;
using cohabit.comms.api.Features.BulkSms.Send;
using cohabit.comms.api.Features.Otp;
using cohabit.comms.api.Features.Otp.Dispatchers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Resend;

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

        services.AddScoped<IOtpCodeStore, InMemoryOtpCodeStore>();
        services.AddScoped<IOtpCodeGenerator, RandomOtpCodeGenerator>();
        services.AddScoped<IMessageDispatcher, SmsMessageDispatcher>();
        services.AddScoped<IMessageDispatcher, EmailMessageDispatcher>();
        services.AddScoped<MessageDispatcherFactory>();
        services.AddScoped<IOtpService, OtpService>();

        services.AddHttpClient<IBulkSmsClient, BulkSmsClient>(client =>
        {
            var config = configuration.GetSection("BulkSms");
            var baseUrl = (config["BaseUrl"] ?? "https://api.bulksms.com/v1").TrimEnd('/') + "/";
            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", config["AuthKey"]);
        });

        services.AddScoped<SendSmsHandler>();
        services.AddScoped<GetAllMessagesHandler>();
        services.AddScoped<GetMessageByIdHandler>();

        services.AddResend(options =>
            options.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty);
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));

        return services;
    }
}
