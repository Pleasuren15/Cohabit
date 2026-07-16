using Azure.Storage.Blobs;

namespace cohabit.api.Services;

public sealed class BlobService(BlobServiceClient blobServiceClient) : IBlobService
{
    private const string ContainerName = "files";

    public async Task<IReadOnlyList<string>> ListAsync(CancellationToken ct = default)
    {
        var container = blobServiceClient.GetBlobContainerClient(ContainerName);
        var blobs = container.GetBlobsAsync(cancellationToken: ct);

        var names = new List<string>();
        await foreach (var blob in blobs)
        {
            names.Add(blob.Name);
        }

        return names;
    }

    public async Task<BlobDownloadResult?> GetAsync(string name, CancellationToken ct = default)
    {
        var container = blobServiceClient.GetBlobContainerClient(ContainerName);
        var blob = container.GetBlobClient(name);

        var exists = await blob.ExistsAsync(ct);
        if (!exists)
            return null;

        var response = await blob.DownloadStreamingAsync(cancellationToken: ct);
        return new BlobDownloadResult(
            response.Value.Content,
            response.Value.Details.ContentType ?? "application/octet-stream");
    }

    public async Task UploadAsync(string name, Stream content, CancellationToken ct = default)
    {
        var container = blobServiceClient.GetBlobContainerClient(ContainerName);
        await container.CreateIfNotExistsAsync(cancellationToken: ct);

        var blob = container.GetBlobClient(name);
        await blob.UploadAsync(content, ct);
    }
}
