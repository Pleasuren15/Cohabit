using cohabit.api.Contracts;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Services;
using cohabit.application.Domain;

namespace cohabit.api.unit.tests;

/// <summary>No-op system messaging used by CRUD tests that don't assert on messages.</summary>
internal sealed class FakeSystemMessagingService : ISystemMessagingService
{
    public Task SendAsync(Guid userId, string title, string content, Guid? listingId = null, CancellationToken ct = default) =>
        Task.CompletedTask;

    public Task SendToListingOwnerAsync(Guid listingId, string title, string content, CancellationToken ct = default) =>
        Task.CompletedTask;

    public Task SendToListingWatchersAsync(Guid listingId, string title, string content, CancellationToken ct = default) =>
        Task.CompletedTask;

    public Task<IReadOnlyList<SystemMessageDto>> GetForUserAsync(Guid userId, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<SystemMessageDto>>(Array.Empty<SystemMessageDto>());

    public Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default) =>
        Task.CompletedTask;
}

/// <summary>No-op messaging accessor used by CRUD tests that don't exercise messages.</summary>
internal sealed class FakeMessagingAccessor : IMessagingAccessor
{
    public Task<IReadOnlyList<Message>> GetMessagesAsync(Guid userId, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<Message>>(Array.Empty<Message>());

    public Task<Message> SendAsync(
        Guid userId,
        Guid senderUserId,
        string title,
        string content,
        Guid? listingId = null,
        CancellationToken ct = default) =>
        throw new NotSupportedException();

    public Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default) =>
        Task.CompletedTask;

    public Task<Guid> GetListingOwnerIdAsync(Guid listingId, CancellationToken ct = default) =>
        throw new NotSupportedException();

    public Task<string> GetListingTitleAsync(Guid listingId, CancellationToken ct = default) =>
        Task.FromResult("Test Listing");

    public Task<IReadOnlyList<Guid>> GetListingFavoriterIdsAsync(Guid listingId, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<Guid>>(Array.Empty<Guid>());

    public Task<string> GetUserDisplayNameAsync(Guid userId, CancellationToken ct = default) =>
        Task.FromResult("Test User");
}
