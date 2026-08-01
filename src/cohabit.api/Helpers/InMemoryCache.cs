using Microsoft.Extensions.Caching.Memory;

namespace cohabit.api.Helpers;

public sealed class InMemoryCache(IMemoryCache cache) : ICache
{
    public bool TryGet<T>(string key, out T? value)
    {
        if (cache.TryGetValue(key, out var cached) && cached is T typed)
        {
            value = typed;
            return true;
        }

        value = default;
        return false;
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default)
    {
        if (cache.TryGetValue(key, out var cached) && cached is T typed)
            return typed;

        var value = await factory(ct);
        cache.Set(key, value, ttl);
        return value;
    }

    public void Set<T>(string key, T value, TimeSpan ttl) => cache.Set(key, value, ttl);

    public void Remove(string key) => cache.Remove(key);
}
