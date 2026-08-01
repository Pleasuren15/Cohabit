using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace cohabit.api.Infrastructure;

public sealed class ApiExceptionFilter(ILogger<ApiExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is ApiException apiException)
        {
            context.Result = apiException switch
            {
                NotFoundException => new NotFoundObjectResult(ErrorBody(apiException)),
                ValidationException => new BadRequestObjectResult(ErrorBody(apiException)),
                ConflictException => new ConflictObjectResult(ErrorBody(apiException)),
                UnauthorizedException => new UnauthorizedObjectResult(ErrorBody(apiException)),
                _ => new ObjectResult(ErrorBody(apiException))
                {
                    StatusCode = apiException.StatusCode
                }
            };
        }
        else
        {
            logger.LogError(context.Exception, "Unhandled exception during request {Path}",
                context.HttpContext.Request.Path);

            context.Result = new ObjectResult(new
            {
                errorCode = "internal_server_error",
                error = "An unexpected error occurred."
            })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }

        context.ExceptionHandled = true;
    }

    private static object ErrorBody(ApiException exception) => new
    {
        errorCode = exception.ErrorCode,
        error = exception.Message
    };
}
