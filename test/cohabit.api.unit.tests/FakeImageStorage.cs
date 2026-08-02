using cohabit.api.Services;

namespace cohabit.api.unit.tests;

internal sealed class FakeImageStorage : IImageStorage
{
    public int UploadCalls { get; private set; }

    public Task<string> UploadAsync(string fileName, byte[] content, string contentType, CancellationToken ct = default)
    {
        UploadCalls++;
        return Task.FromResult($"https://blob.local/images/{UploadCalls}.jpg");
    }
}
