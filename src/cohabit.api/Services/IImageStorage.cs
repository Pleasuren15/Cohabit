namespace cohabit.api.Services;

public interface IImageStorage
{
    Task<string> UploadAsync(string fileName, byte[] content, string contentType, CancellationToken ct = default);
}
