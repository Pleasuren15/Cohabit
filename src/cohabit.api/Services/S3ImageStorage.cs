using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace cohabit.api.Services;

/// <summary>
/// IIdDocumentStorage backed by S3 (AWS, or the LocalStack container wired up in
/// the Aspire AppHost for local development). The bucket is private — reads go
/// through presigned GET URLs only.
/// </summary>
public sealed class S3ImageStorage(IAmazonS3 s3Client, IOptions<S3StorageOptions> options) : IIdDocumentStorage
{
    private readonly S3StorageOptions _options = options.Value;

    public async Task<string> UploadAsync(
        string fileName,
        byte[] content,
        string contentType,
        CancellationToken ct = default)
    {
        var key = $"{Guid.NewGuid()}{ImageFormatDetector.ResolveExtension(fileName, content)}";
        await s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = new MemoryStream(content),
            ContentType = ImageFormatDetector.ResolveContentType(contentType, content),
            AutoCloseStream = true
        }, ct);
        return key;
    }

    public Task<string> GetTemporaryReadUrlAsync(string path, TimeSpan? lifetime = default, CancellationToken ct = default)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = path,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.Add(lifetime ?? _options.PresignedUrlLifetime)
        };
        return Task.FromResult(s3Client.GetPreSignedURL(request));
    }

    /// <summary>Creates the bucket if missing. Called once at API startup.</summary>
    public async Task EnsureBucketAsync(CancellationToken ct = default)
    {
        var exists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(s3Client, _options.BucketName);
        if (!exists)
            await s3Client.PutBucketAsync(_options.BucketName, ct);
    }
}
