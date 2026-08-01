namespace cohabit.api.Infrastructure;

public sealed class UnauthorizedException(string errorCode, string message) : ApiException(StatusCodes.Status401Unauthorized, errorCode, message);
