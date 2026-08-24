namespace cohabit.api.Services;

/// <summary>
/// Public image store (listing photos). Azure Blob in every environment.
/// </summary>
public interface IImageStorage
{
    /// <summary>
    /// Uploads an image and returns its durable public URL.
    /// </summary>
    Task<string> UploadAsync(string fileName, byte[] content, string contentType, CancellationToken ct = default);
}
