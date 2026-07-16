namespace cohabit.api.Services;

public interface IBlobService
{
    Task<IReadOnlyList<string>> ListAsync(CancellationToken ct = default);
    Task<BlobDownloadResult?> GetAsync(string name, CancellationToken ct = default);
    Task UploadAsync(string name, Stream content, CancellationToken ct = default);
}

public record BlobDownloadResult(Stream Content, string ContentType);
