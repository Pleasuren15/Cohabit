using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class ReportsControllerTests
{
    [Test]
    public async Task Given_ValidRequest_When_SubmitIsInvoked_Then_ReturnsOkWithOpenStatus()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();
        var request = new ReportListingRequest(data.RoomListing.Id, "Thabo Mokoena", "scam", "Asked me to e-wallet a deposit.");

        // Act
        var result = await controller.Submit(request);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        var dto = ok.Value.Should().BeAssignableTo<ReportResultDto>().Subject;
        dto.ListingId.Should().Be(data.RoomListing.Id);
        dto.Reason.Should().Be("scam");
        dto.Status.Should().Be("open");
        dto.SubmittedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Test]
    public async Task Given_ValidRequest_When_SubmitIsInvoked_Then_EmailsTheSafetyTeam()
    {
        // Arrange
        var (controller, data, sender) = await CreateSystemUnderTestAsync();
        var request = new ReportListingRequest(
            data.RoomListing.Id,
            "Thabo Mokoena",
            "fraud",
            "Asked me to e-wallet a deposit before viewing.");

        // Act
        await controller.Submit(request);

        // Assert
        sender.Sent.Should().ContainSingle();
        var context = sender.Sent.Single();
        context.RecipientEmail.Should().Be("safety@cohabit.test");
        context.Listing.Id.Should().Be(data.RoomListing.Id);
        context.Listing.Title.Should().Be("Sunny room in Sea Point");
        context.Request.Reason.Should().Be("fraud");
        context.Request.Details.Should().Contain("e-wallet");
        context.ReportId.Should().NotBeEmpty();
    }

    [Test]
    public async Task Given_UnknownReason_When_SubmitIsInvoked_Then_ThrowsValidationException()
    {
        // Arrange
        var (controller, data, sender) = await CreateSystemUnderTestAsync();
        var request = new ReportListingRequest(data.RoomListing.Id, "Thabo Mokoena", "not-a-real-reason", null);

        // Act
        var act = async () => await controller.Submit(request);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .Where(e => e.ErrorCode == "invalid_report_reason");
        sender.Sent.Should().BeEmpty();
    }

    [Test]
    public async Task Given_MissingListing_When_SubmitIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, sender) = await CreateSystemUnderTestAsync();
        var request = new ReportListingRequest(Guid.NewGuid(), "Thabo Mokoena", "scam", null);

        // Act
        var act = async () => await controller.Submit(request);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(e => e.ErrorCode == "listing_not_found");
        sender.Sent.Should().BeEmpty();
    }

    [Test]
    public async Task Given_Report_When_HtmlIsBuilt_Then_IncludesReasonListingDetailsAndEscapesContent()
    {
        // Arrange
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);
        var listingService = new ListingService(
            new ListingAccessor(db),
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            new FakeImageStorage(),
            new FakeSystemMessagingService(),
            NullLogger<ListingService>.Instance);
        var listing = await listingService.GetByIdAsync(data.RoomListing.Id, CancellationToken.None);
        var request = new ReportListingRequest(
            data.RoomListing.Id,
            "Thabo <b>Mokoena</b>",
            "scam",
            "Sent <script>alert(1)</script> and asked for payment.");
        var reportId = Guid.NewGuid();

        // Act
        var html = ReportEmailHtml.Build(request, listing, reportId, DateTime.UtcNow);

        // Assert
        html.Should().Contain("It&#39;s a scam");
        html.Should().Contain("Sunny room in Sea Point");
        html.Should().Contain("R7,500");
        html.Should().Contain("Thabo &lt;b&gt;Mokoena&lt;/b&gt;");
        html.Should().Contain("&lt;script&gt;");
        html.Should().NotContain("<script>");
        html.Should().Contain(reportId.ToString());
    }

    private static async Task<(ReportsController Controller, TestData Data, RecordingReportEmailSender Sender)>
        CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var listingService = new ListingService(
            new ListingAccessor(db),
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            new FakeImageStorage(),
            new FakeSystemMessagingService(),
            NullLogger<ListingService>.Instance);

        var sender = new RecordingReportEmailSender();
        var options = Options.Create(new ReportOptions
        {
            RecipientEmail = "safety@cohabit.test",
            From = ""
        });

        var service = new ReportService(
            listingService,
            sender,
            options,
            NullLogger<ReportService>.Instance);

        return (new ReportsController(service), data, sender);
    }
}

/// <summary>Captures report email contexts so tests can assert on what would have been sent.</summary>
internal sealed class RecordingReportEmailSender : IReportEmailSender
{
    public List<ReportEmailContext> Sent { get; } = [];

    public Task SendAsync(ReportEmailContext context, CancellationToken ct = default)
    {
        Sent.Add(context);
        return Task.CompletedTask;
    }
}
