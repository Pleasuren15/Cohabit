using cohabit.application.Domain;

namespace cohabit.api.Services;

public interface IAuthService
{
    Task<User> SyncUserFromJwt(CancellationToken ct = default);
}