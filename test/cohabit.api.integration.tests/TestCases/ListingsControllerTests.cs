using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class ListingsControllerTests : ApiTestBase
{
    private static readonly byte[] JpegBytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46];

    [Test]
    public async Task Given_NoFilters_When_BrowseIsInvoked_Then_ReturnsAllActiveListings()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        await Data.CreateListingAsync(
            owner,
            title: "Modern Sandton apartment",
            listingTypeName: "Apartment",
            suburb: "Sandton",
            provinceName: "Gauteng",
            price: 15000);

        // Act
        var response = await Client.GetAsync("/api/listings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.TotalCount.Should().Be(2);
        paged.TotalPages.Should().Be(1);
        paged.Items.Select(i => i.Title).Should().Contain(["Sunny room in Sea Point", "Modern Sandton apartment"]);
    }

    [Test]
    public async Task Given_ProvinceFilter_When_BrowseIsInvoked_Then_ReturnsOnlyListingsInThatProvince()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var wcListing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        await Data.CreateListingAsync(
            owner,
            title: "Modern Sandton apartment",
            listingTypeName: "Apartment",
            suburb: "Sandton",
            provinceName: "Gauteng",
            price: 15000);
        var westernCape = await Data.ProvinceByNameAsync("Western Cape");

        // Act
        var response = await Client.GetAsync($"/api/listings?provinceId={westernCape.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(wcListing.Id);
    }

    [Test]
    public async Task Given_RoommateTypeFilter_When_BrowseIsInvoked_Then_ReturnsOnlyRoommateListings()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var roomListing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        await Data.CreateListingAsync(
            owner,
            title: "Modern Sandton apartment",
            listingTypeName: "Apartment",
            suburb: "Sandton",
            provinceName: "Gauteng",
            price: 15000);

        // Act
        var response = await Client.GetAsync("/api/listings?type=Roommate");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(roomListing.Id);
        paged.Items.Single().Type.Should().Be("Room");
    }

    [Test]
    public async Task Given_SearchTerm_When_BrowseIsInvoked_Then_ReturnsMatchingListings()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var roomListing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        await Data.CreateListingAsync(
            owner,
            title: "Modern Sandton apartment",
            listingTypeName: "Apartment",
            suburb: "Sandton",
            provinceName: "Gauteng",
            price: 15000);

        // Act
        var response = await Client.GetAsync("/api/listings?q=sea%20point");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(roomListing.Id);
    }

    [Test]
    public async Task Given_OutOfRangePageSize_When_BrowseIsInvoked_Then_ReturnsClampedPageSize()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        await Data.CreateListingAsync(owner);

        // Act
        var response = await Client.GetAsync("/api/listings?page=0&pageSize=500");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.Page.Should().Be(1);
        paged.PageSize.Should().Be(20);
    }

    [Test]
    public async Task Given_ExpiredListing_When_BrowseIsInvoked_Then_ExpiredListingsAreExcluded()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        await Data.CreateListingAsync(owner, title: "Expired room", expires: DateTime.UtcNow.AddDays(-1));

        // Act
        var response = await Client.GetAsync("/api/listings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await response.Content.ReadFromJsonAsync<PagedResult<ListingSummaryDto>>();
        paged!.TotalCount.Should().Be(1);
        paged.Items.Single().Title.Should().Be("Sunny room in Sea Point");
    }

    [Test]
    public async Task Given_ExistingListing_When_GetByIdIsInvoked_Then_ReturnsFullDetail()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var listing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point", price: 7500);

        // Act
        var response = await Client.GetAsync($"/api/listings/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await response.Content.ReadFromJsonAsync<ListingDetailDto>();
        detail!.Id.Should().Be(listing.Id);
        detail.Title.Should().Be("Sunny room in Sea Point");
        detail.Price.Should().Be(7500);
        detail.Owner.FirstName.Should().Be("Alice");
        detail.Address.Suburb.Should().Be("Sea Point");
        detail.Address.Province.Name.Should().Be("Western Cape");
    }

    [Test]
    public async Task Given_UnknownListingId_When_GetByIdIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange

        // Act
        var response = await Client.GetAsync($"/api/listings/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("listing_not_found");
    }

    [Test]
    public async Task Given_NewImage_When_CreateIsInvoked_Then_UploadsToBlobStorageAndReturnsCreatedListing()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var province = await Data.ProvinceByNameAsync("Western Cape");
        var type = await Data.ListingTypeByNameAsync("Room");
        using var content = CreateListingForm(owner.Id, province.Id, type.Id, JpegBytes);

        // Act
        var response = await Client.PostAsync("/api/listings", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var detail = await response.Content.ReadFromJsonAsync<ListingDetailDto>();
        detail!.Title.Should().Be("Cosy studio");
        detail.Images.Should().ContainSingle().Which.Should().Contain("/cohabit-images/");
    }

    [Test]
    public async Task Given_MissingUser_When_CreateIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var province = await Data.ProvinceByNameAsync("Western Cape");
        var type = await Data.ListingTypeByNameAsync("Room");
        using var content = CreateListingForm(Guid.NewGuid(), province.Id, type.Id, JpegBytes);

        // Act
        var response = await Client.PostAsync("/api/listings", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("user_not_found");
    }

    private static MultipartFormDataContent CreateListingForm(
        Guid userId,
        int provinceId,
        int typeId,
        byte[] imageBytes)
    {
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(userId.ToString()), "UserId");
        content.Add(new StringContent("Cosy studio"), "Title");
        content.Add(new StringContent("Bright studio near the station"), "Description");
        content.Add(new StringContent(typeId.ToString()), "TypeId");
        content.Add(new StringContent("6500"), "Price");
        content.Add(new StringContent("6500"), "Deposit");
        content.Add(new StringContent("1"), "Beds");
        content.Add(new StringContent("1"), "Baths");
        content.Add(new StringContent("2026-10-01"), "AvailableFrom");
        content.Add(new StringContent("Within the hour"), "ResponseTime");
        content.Add(new StringContent("5 Test Rd"), "AddressLine1");
        content.Add(new StringContent("2nd Floor"), "AddressLine2");
        content.Add(new StringContent("Test Town"), "Suburb");
        content.Add(new StringContent("8000"), "PostalCode");
        content.Add(new StringContent(provinceId.ToString()), "ProvinceId");

        var image = new ByteArrayContent(imageBytes);
        image.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeNames.Image.Jpeg);
        content.Add(image, "images", "photo.jpg");

        return content;
    }
}
