using cohabit.application.Features.BulkSms;
using cohabit.application.Features.BulkSms.Messages;
using cohabit.application.Features.BulkSms.Send;
using cohabit.verification.api.Features.BulkSms;
using cohabit.verification.api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers (existing) ──────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ── BulkSms feature — handlers ──────────────────────────────────────
builder.Services.AddScoped<SendSmsHandler>();
builder.Services.AddScoped<GetAllMessagesHandler>();
builder.Services.AddScoped<GetMessageByIdHandler>();

builder.Services.AddHttpClient<IBulkSmsClient, BulkSmsClient>(client =>
{
    var config = builder.Configuration.GetSection("BulkSms");
    client.BaseAddress = new Uri(config["BaseUrl"] ?? "https://api.bulksms.com/v1");
    client.DefaultRequestHeaders.Add("Authorization", config["ApiKey"] ?? "");
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// ── Minimal API endpoints ───────────────────────────────────────────
app.MapBulkSmsEndpoints();

app.Run();
