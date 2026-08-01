namespace cohabit.api.Infrastructure;

public sealed class NotFoundException(string errorCode, string message) : ApiException(StatusCodes.Status404NotFound, errorCode, message);
