using System.Net.Http.Headers;
using cohabit.application.Features.BulkSms;
using cohabit.application.Features.BulkSms.Messages;
using cohabit.application.Features.BulkSms.Send;
using cohabit.verification.api.Infrastructure;

namespace cohabit.verification.api.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddOpenApi();

        services.AddScoped<SendSmsHandler>();
        services.AddScoped<GetAllMessagesHandler>();
        services.AddScoped<GetMessageByIdHandler>();

        services.AddHttpClient<IBulkSmsClient, BulkSmsClient>(client =>
        {
            var config = configuration.GetSection("BulkSms");
            var baseUrl = (config["BaseUrl"] ?? "https://api.bulksms.com/v1").TrimEnd('/') + "/";
            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", config["AuthKey"]);
        });

        return services;
    }
}
