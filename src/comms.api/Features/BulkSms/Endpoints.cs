using cohabit.application.Features.BulkSms;
using cohabit.application.Features.BulkSms.Messages;
using cohabit.application.Features.BulkSms.Send;

namespace cohabit.comms.api.Features.BulkSms;

public static class BulkSmsEndpoints
{
    private const string Tag = "BulkSms";

    public static void MapBulkSmsEndpoints(this WebApplication app)
    {
        // GET /messages — list all messages from BulkSMS
        app.MapGet("/messages", async (
            GetAllMessagesHandler handler,
            CancellationToken ct) =>
        {
            try
            {
                var messages = await handler.HandleAsync(ct);
                return Results.Ok(messages);
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "BulkSMS upstream request failed",
                    detail: ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "An unexpected error occurred",
                    detail: ex.Message);
            }
        })
        .WithName("GetMessages")
        .WithTags(Tag);

        // GET /messages/{id} — get a single message from BulkSMS by its ID
        app.MapGet("/messages/{id}", async (
            string id,
            GetMessageByIdHandler handler,
            CancellationToken ct) =>
        {
            try
            {
                var message = await handler.HandleAsync(id, ct);
                return message is not null ? Results.Ok(message) : Results.NotFound();
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "BulkSMS upstream request failed",
                    detail: ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "An unexpected error occurred",
                    detail: ex.Message);
            }
        })
        .WithName("GetMessageById")
        .WithTags(Tag);

        // POST /send — send an SMS via BulkSMS
        app.MapPost("/send", async (
            SendSmsRequest request,
            SendSmsHandler handler,
            CancellationToken ct) =>
        {
            try
            {
                var response = await handler.HandleAsync(request, ct);
                return Results.Ok(response);
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "BulkSMS upstream request failed",
                    detail: ex.Message);
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "An unexpected error occurred",
                    detail: ex.Message);
            }
        })
        .WithName("SendSms")
        .WithTags(Tag);
    }
}
