using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.application.Data;

namespace cohabit.api.Services;

public interface ISystemMessagingService
{
    Task SendAsync(Guid userId, string title, string content, Guid? listingId = null, CancellationToken ct = default);

    Task SendToListingOwnerAsync(Guid listingId, string title, string content, CancellationToken ct = default);

    Task SendToListingWatchersAsync(Guid listingId, string title, string content, CancellationToken ct = default);

    Task<IReadOnlyList<SystemMessageDto>> GetForUserAsync(Guid userId, CancellationToken ct = default);

    Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default);
}

public sealed class SystemMessagingService(
    IMessagingAccessor messagingAccessor,
    ICache cache,
    ILogger<SystemMessagingService> logger) : ISystemMessagingService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task SendAsync(Guid userId, string title, string content, Guid? listingId = null, CancellationToken ct = default)
    {
        await messagingAccessor.SendAsync(userId, SystemUser.Id, title, content, listingId, ct);
        logger.LogInformation("Sent system message '{Title}' to user {UserId}", title, userId);
        cache.Remove(CacheKeys.UserMessages(userId));
    }

    public async Task SendToListingOwnerAsync(Guid listingId, string title, string content, CancellationToken ct = default)
    {
        var ownerId = await messagingAccessor.GetListingOwnerIdAsync(listingId, ct);
        await SendAsync(ownerId, title, content, listingId, ct);
    }

    public async Task SendToListingWatchersAsync(Guid listingId, string title, string content, CancellationToken ct = default)
    {
        var watcherIds = await messagingAccessor.GetListingFavoriterIdsAsync(listingId, ct);
        foreach (var watcherId in watcherIds)
            await SendAsync(watcherId, title, content, listingId, ct);
    }

    public async Task<IReadOnlyList<SystemMessageDto>> GetForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var key = CacheKeys.UserMessages(userId);

        return await cache.GetOrSetAsync(key, async token =>
        {
            var messages = await messagingAccessor.GetMessagesAsync(userId, token);
            return messages
                .Select(m => new SystemMessageDto(
                    m.Id,
                    m.ConversationId,
                    m.Conversation.ListingId,
                    m.Conversation.Listing?.Title,
                    m.Title,
                    m.Content,
                    m.IsRead,
                    m.Timestamp))
                .ToList();
        }, CacheTtl, ct);
    }

    public async Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default)
    {
        await messagingAccessor.MarkReadAsync(userId, messageId, ct);
        cache.Remove(CacheKeys.UserMessages(userId));
    }
}
