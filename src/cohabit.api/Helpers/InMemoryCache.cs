using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;

namespace cohabit.api.Helpers;

public sealed class InMemoryCache(IMemoryCache cache) : ICache
{
    private readonly ConcurrentDictionary<string, byte> _keys = new();

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
        _keys[key] = default;
        return value;
    }

    public void Set<T>(string key, T value, TimeSpan ttl)
    {
        cache.Set(key, value, ttl);
        _keys[key] = default;
    }

    public void Remove(string key)
    {
        cache.Remove(key);
        _keys.TryRemove(key, out _);
    }

    public void RemoveByPrefix(string prefix)
    {
        foreach (var key in _keys.Keys.Where(k => k.StartsWith(prefix, StringComparison.Ordinal)).ToList())
            Remove(key);
    }
}
