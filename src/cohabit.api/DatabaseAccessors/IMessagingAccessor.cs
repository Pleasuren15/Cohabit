using cohabit.application.Domain;

namespace cohabit.api.DatabaseAccessors;

public interface IMessagingAccessor
{
    Task<IReadOnlyList<Message>> GetMessagesAsync(Guid userId, CancellationToken ct = default);

    Task<Message> SendAsync(
        Guid userId,
        Guid senderUserId,
        string title,
        string content,
        Guid? listingId = null,
        CancellationToken ct = default);

    Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default);

    Task<Guid> GetListingOwnerIdAsync(Guid listingId, CancellationToken ct = default);

    Task<string> GetListingTitleAsync(Guid listingId, CancellationToken ct = default);

    Task<IReadOnlyList<Guid>> GetListingFavoriterIdsAsync(Guid listingId, CancellationToken ct = default);

    Task<string> GetUserDisplayNameAsync(Guid userId, CancellationToken ct = default);
}
