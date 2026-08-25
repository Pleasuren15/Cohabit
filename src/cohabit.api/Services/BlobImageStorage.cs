using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace cohabit.api.Services;

/// <summary>
/// Public listing-image store on Azure Blob (container created with public read
/// access at startup). ID documents do NOT go through here — see
/// <see cref="IIdDocumentStorage"/> for the private S3-backed store.
/// </summary>
public sealed class BlobImageStorage(BlobServiceClient blobServiceClient) : IImageStorage
{
    public const string ContainerName = "cohabit-images";

    private readonly BlobContainerClient _container = blobServiceClient.GetBlobContainerClient(ContainerName);

    public async Task<string> UploadAsync(
        string fileName,
        byte[] content,
        string contentType,
        CancellationToken ct = default)
    {
        var extension = ImageFormatDetector.ResolveExtension(fileName, content);
        var resolvedContentType = ImageFormatDetector.ResolveContentType(contentType, content);

        var blobName = $"{Guid.NewGuid()}{extension}";
        var blobClient = _container.GetBlobClient(blobName);
        using var stream = new MemoryStream(content);
        await blobClient.UploadAsync(
            stream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = resolvedContentType
                }
            },
            ct);
        return blobClient.Uri.AbsoluteUri;
    }
}
