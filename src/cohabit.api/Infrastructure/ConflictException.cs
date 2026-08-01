namespace cohabit.api.Infrastructure;

public sealed class ConflictException(string errorCode, string message) : ApiException(StatusCodes.Status409Conflict, errorCode, message);
