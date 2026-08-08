using WireMock.Server;

namespace comms.api.integration.tests.Infrastructure;

/// <summary>WireMock server standing in for the SMS Portal BulkMessages API.</summary>
public sealed class SmsPortalWireMockServer : IDisposable, IAsyncDisposable
{
    public SmsPortalWireMockServer() => Server = WireMockServer.Start();

    public WireMockServer Server { get; }

    public string BaseUrl => Server.Url!;

    public void Dispose() => Server.Dispose();

    public ValueTask DisposeAsync()
    {
        Server.Dispose();
        return ValueTask.CompletedTask;
    }
}
