namespace cohabit.api.Infrastructure;

public sealed class DatabaseException(string errorCode, string message) : ApiException(StatusCodes.Status500InternalServerError, errorCode, message);
