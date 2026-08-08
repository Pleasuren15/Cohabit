using cohabit.api.Infrastructure;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.api.DatabaseAccessors;

public sealed class MessagingAccessor(CohabitDbContext dbContext) : IMessagingAccessor
{
    public async Task<IReadOnlyList<Message>> GetMessagesAsync(Guid userId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        return await dbContext.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
                .ThenInclude(c => c.Listing)
            .Where(m => m.Conversation.TenantUserId == userId)
            .OrderByDescending(m => m.Timestamp)
            .ToListAsync(ct);
    }

    public async Task<Message> SendAsync(
        Guid userId,
        Guid senderUserId,
        string title,
        string content,
        Guid? listingId = null,
        CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        var conversation = listingId is null
            ? await dbContext.Conversations.FirstOrDefaultAsync(
                c => c.OwnerUserId == SystemUser.Id
                  && c.TenantUserId == userId
                  && c.ListingId == null,
                ct)
            : await dbContext.Conversations.FirstOrDefaultAsync(
                c => c.OwnerUserId == SystemUser.Id
                  && c.TenantUserId == userId
                  && c.ListingId == listingId,
                ct);

        if (conversation is null)
        {
            conversation = Conversation.Create(SystemUser.Id, userId, listingId);
            dbContext.Conversations.Add(conversation);
        }

        var message = Message.Create(conversation.Id, senderUserId, title, content);
        dbContext.Messages.Add(message);
        await dbContext.SaveChangesAsync(ct);

        return message;
    }

    public async Task MarkReadAsync(Guid userId, Guid messageId, CancellationToken ct = default)
    {
        await EnsureUserExistsAsync(userId, ct);

        var message = await dbContext.Messages
            .FirstOrDefaultAsync(
                m => m.Id == messageId && m.Conversation.TenantUserId == userId,
                ct);
        if (message is null)
            throw new NotFoundException("message_not_found", $"Message '{messageId}' was not found.");

        message.MarkRead();
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<Guid> GetListingOwnerIdAsync(Guid listingId, CancellationToken ct = default)
    {
        var ownerId = await dbContext.Listings
            .Where(l => l.Id == listingId)
            .Select(l => (Guid?)l.UserId)
            .FirstOrDefaultAsync(ct);
        if (ownerId is null)
            throw new NotFoundException("listing_not_found", $"Listing '{listingId}' was not found.");

        return ownerId.Value;
    }

    public async Task<string> GetListingTitleAsync(Guid listingId, CancellationToken ct = default)
    {
        var title = await dbContext.Listings
            .AsNoTracking()
            .Where(l => l.Id == listingId)
            .Select(l => (string?)l.Title)
            .FirstOrDefaultAsync(ct);
        if (title is null)
            throw new NotFoundException("listing_not_found", $"Listing '{listingId}' was not found.");

        return title;
    }

    public async Task<IReadOnlyList<Guid>> GetListingFavoriterIdsAsync(Guid listingId, CancellationToken ct = default)
    {
        return await dbContext.WatchLists
            .AsNoTracking()
            .Where(w => w.ListingId == listingId)
            .Select(w => w.UserId)
            .ToListAsync(ct);
    }

    public async Task<string> GetUserDisplayNameAsync(Guid userId, CancellationToken ct = default)
    {
        var name = await dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.FirstName + " " + u.LastName)
            .FirstOrDefaultAsync(ct);
        if (name is null)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");

        return name;
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken ct = default)
    {
        if (await dbContext.Users.AnyAsync(u => u.Id == userId, ct) is false)
            throw new NotFoundException("user_not_found", $"User '{userId}' was not found.");
    }
}
