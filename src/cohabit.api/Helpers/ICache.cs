namespace cohabit.api.Helpers;

public interface ICache
{
    bool TryGet<T>(string key, out T? value);

    Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default);

    void Set<T>(string key, T value, TimeSpan ttl);

    void Remove(string key);

    void RemoveByPrefix(string prefix);
}
