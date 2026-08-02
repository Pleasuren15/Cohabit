using cohabit.comms.api.Extensions;
using cohabit.comms.api.Features.BulkSms;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapBulkSmsEndpoints();

app.MapGet("/", () => Results.Redirect("/scalar/v1")).ExcludeFromDescription();

app.Run();
