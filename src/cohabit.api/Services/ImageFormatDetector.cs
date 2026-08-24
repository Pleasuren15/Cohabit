namespace cohabit.api.Services;

/// <summary>
/// Sniffs image bytes for a known magic number so we never trust client-supplied
/// content types or extensions.
/// </summary>
public static class ImageFormatDetector
{
    public static (string? Extension, string? ContentType) Detect(ReadOnlySpan<byte> b)
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

    /// <summary>Picks an extension from sniffed magic bytes, falling back to the file name.</summary>
    public static string ResolveExtension(string fileName, ReadOnlySpan<byte> content)
    {
        var detected = Detect(content);
        var extension = detected.Extension
            ?? (!string.IsNullOrWhiteSpace(fileName) ? Path.GetExtension(fileName) : null)
            ?? ".bin";
        return extension.ToLowerInvariant();
    }

    /// <summary>Sniffed content type wins; the caller-supplied value is only a fallback.</summary>
    public static string ResolveContentType(string fallbackContentType, ReadOnlySpan<byte> content)
    {
        return Detect(content).ContentType ?? fallbackContentType;
    }
}
