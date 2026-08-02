using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace cohabit.api.Services;

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
        var detected = DetectImageFormat(content);
        var extension = detected.Extension
            ?? (!string.IsNullOrWhiteSpace(fileName) ? Path.GetExtension(fileName) : null)
            ?? ".bin";

        var blobName = $"{Guid.NewGuid()}{extension.ToLowerInvariant()}";
        var blobClient = _container.GetBlobClient(blobName);
        using var stream = new MemoryStream(content);
        await blobClient.UploadAsync(
            stream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = detected.ContentType ?? contentType
                }
            },
            ct);
        return blobClient.Uri.AbsoluteUri;
    }

    private static (string? Extension, string? ContentType) DetectImageFormat(ReadOnlySpan<byte> b)
    {
        if (b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
            && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A)
            return (".png", "image/png");
        if (b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF)
            return (".jpg", "image/jpeg");
        if (b.Length >= 12 && b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46
            && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50)
            return (".webp", "image/webp");
        if (b.Length >= 6 && b[0] == 0x47 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x38)
            return (".gif", "image/gif");
        if (b.Length >= 2 && b[0] == 0x42 && b[1] == 0x4D)
            return (".bmp", "image/bmp");
        return (null, null);
    }
}
