namespace cohabit.application.Domain;

public sealed class Message
{
    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public Guid SenderUserId { get; private set; }
    public string Title { get; private set; }
    public string Content { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime Timestamp { get; private set; }

    // Navigation
    public Conversation Conversation { get; private set; } = null!;
    public User Sender { get; private set; } = null!;

    private Message() { }

    public static Message Create(
        Guid conversationId,
        Guid senderUserId,
        string title,
        string content)
    {
        return new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderUserId = senderUserId,
            Title = title,
            Content = content,
            IsRead = false,
            Timestamp = DateTime.UtcNow
        };
    }

    public void MarkRead() => IsRead = true;
}
