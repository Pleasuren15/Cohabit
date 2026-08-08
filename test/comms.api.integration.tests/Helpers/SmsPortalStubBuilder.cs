using System.Net;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

namespace comms.api.integration.tests.Helpers;

/// <summary>Configures WireMock responses for the SMS Portal /BulkMessages endpoint.</summary>
public static class SmsPortalStubBuilder
{
    public static void RespondWithSuccess(WireMockServer server) =>
        server.Given(Request.Create().WithPath("/BulkMessages").UsingPost())
            .RespondWith(Response.Create().WithStatusCode(HttpStatusCode.OK));

    public static void RespondWithServerError(WireMockServer server) =>
        server.Given(Request.Create().WithPath("/BulkMessages").UsingPost())
            .RespondWith(Response.Create().WithStatusCode(HttpStatusCode.InternalServerError));
}
