using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class ReportsControllerTests : ApiTestBase
{
[SetUp]
public void ClearCapturedEmails() => CapturingReportEmailSender.Clear();

    [Test]
    public async Task Given_ValidReport_When_SubmitIsInvoked_Then_ReturnsOkAndEmailsSafetyTeam()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var listing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        var reporter = await Data.CreateUserAsync(
            firstName: "Thabo",
            lastName: "Mokoena",
            email: "thabo@example.com",
            cellphone: "0810000001");
        var token = TestJwt.CreateToken(reporter.Id);
        var request = new ReportListingRequest(
            listing.Id,
            "Thabo Mokoena",
            "scam",
            "Asked me to e-wallet a deposit before viewing.");

        // Act
        var response = await SubmitAsync(token, request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await response.Content.ReadFromJsonAsync<ReportResultDto>();        dto!.ListingId.Should().Be(listing.Id);
        dto.Reason.Should().Be("scam");
        dto.Status.Should().Be("open");
        dto.SubmittedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        var context = CapturingReportEmailSender.Last();
        context.Should().NotBeNull();
        context!.Listing.Title.Should().Be("Sunny room in Sea Point");
        context.Listing.Price.Should().Be(7500);
        context.RecipientEmail.Should().Be("pleasurendhlovu.dev@gmail.com");
        context.Request.Reason.Should().Be("scam");
        context.Request.Details.Should().Contain("e-wallet");
    }

    [Test]
    public async Task Given_NoToken_When_SubmitIsInvoked_Then_ReportStillSucceeds()
    {
        // Arrange — reporting is anonymous so guests can flag a listing too.
        var owner = await Data.CreateUserAsync();
        var listing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");

        // Act
        var response = await Client.PostAsJsonAsync(
            "/api/reports",
            new ReportListingRequest(listing.Id, "Guest", "scam", null));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var context = CapturingReportEmailSender.Last();
        context.Should().NotBeNull();
        context!.Listing.Id.Should().Be(listing.Id);
        context.Request.ReporterName.Should().Be("Guest");
    }

    [Test]
    public async Task Given_InvalidReason_When_SubmitIsInvoked_Then_ReturnsBadRequest()
    {
        // Arrange
        var reporter = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(reporter.Id);

        // Act
        var response = await SubmitAsync(
            token,
            new ReportListingRequest(Guid.NewGuid(), "Thabo Mokoena", "not-a-real-reason", null));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("invalid_report_reason");
    }

    [Test]
    public async Task Given_MissingListing_When_SubmitIsInvoked_Then_ReturnsNotFound()
    {
        // Arrange
        var reporter = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(reporter.Id);

        // Act
        var response = await SubmitAsync(
            token,
            new ReportListingRequest(Guid.NewGuid(), "Thabo Mokoena", "scam", null));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("listing_not_found");
    }

    private Task<HttpResponseMessage> SubmitAsync(string token, ReportListingRequest request)
    {
        var http = new HttpRequestMessage(HttpMethod.Post, "/api/reports")
        {
            Content = JsonContent.Create(request)
        };
        http.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return Client.SendAsync(http);
    }
}
