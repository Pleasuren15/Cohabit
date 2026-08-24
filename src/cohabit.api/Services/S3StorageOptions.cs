namespace cohabit.api.Services;

public sealed class S3StorageOptions
{
    public const string SectionName = "S3";

    /// <summary>Custom endpoint (e.g. LocalStack). Null/empty means real AWS.</summary>
    public string? ServiceUrl { get; set; }

    public string Region { get; set; } = "us-east-1";
    public string? AccessKey { get; set; }
    public string? SecretKey { get; set; }

    /// <summary>Private bucket holding ID verification documents.</summary>
    public string BucketName { get; set; } = "cohabit-id-documents";

    public TimeSpan PresignedUrlLifetime { get; set; } = TimeSpan.FromMinutes(15);
}
