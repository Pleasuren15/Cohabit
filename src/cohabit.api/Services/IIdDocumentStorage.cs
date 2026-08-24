namespace cohabit.api.Services;

/// <summary>
/// Private store for identity-document images submitted for verification.
/// Backed by S3 (LocalStack locally, AWS in production). Objects are never
/// publicly readable — callers persist the returned object path and resolve
/// short-lived read URLs for review UIs.
/// </summary>
public interface IIdDocumentStorage
{
    /// <summary>
    /// Uploads a document image and returns its object path (never a public URL).
    /// </summary>
    Task<string> UploadAsync(string fileName, byte[] content, string contentType, CancellationToken ct = default);

    /// <summary>
    /// Short-lived read URL for an object path (S3 presigned GET).
    /// </summary>
    Task<string> GetTemporaryReadUrlAsync(string path, TimeSpan? lifetime = null, CancellationToken ct = default);
}
