namespace cohabit.api.Contracts;

/// <summary>An in-app system notification shown in the user's Messages feed.</summary>
public sealed record SystemMessageDto(
    Guid Id,
    Guid ConversationId,
    Guid? ListingId,
    string? ListingTitle,
    string Title,
    string Content,
    bool IsRead,
    DateTime Timestamp);
