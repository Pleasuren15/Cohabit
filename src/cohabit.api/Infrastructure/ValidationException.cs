namespace cohabit.api.Infrastructure;

public sealed class ValidationException(string errorCode, string message) : ApiException(StatusCodes.Status400BadRequest, errorCode, message);
