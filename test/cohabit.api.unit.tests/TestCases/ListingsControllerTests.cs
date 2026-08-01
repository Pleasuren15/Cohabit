using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using cohabit.application.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class ListingsControllerTests
{
    [Test]
    public async Task Given_NoFilters_When_BrowseIsInvoked_Then_ReturnsOkResultWithActiveListings()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(null, null, null, 1, 20, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.TotalCount.Should().Be(2);
        paged.TotalPages.Should().Be(1);
        paged.Items.Select(i => i.Id).Should().BeEquivalentTo([data.RoomListing.Id, data.ApartmentListing.Id]);
    }

    [Test]
    public async Task Given_ProvinceFilter_When_BrowseIsInvoked_Then_ReturnsOnlyListingsInThatProvince()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(data.WesternCape.Id, null, null, 1, 20, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.TotalCount.Should().Be(1);
        paged.Items.Should().ContainSingle();
        paged.Items.Single().Id.Should().Be(data.RoomListing.Id);
    }

    [Test]
    public async Task Given_RoommateTypeFilter_When_BrowseIsInvoked_Then_ReturnsOnlyRoommateListings()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(null, ListingKind.Roommate, null, 1, 20, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(data.RoomListing.Id);
        paged.Items.Single().Type.Should().Be("Room");
    }

    [Test]
    public async Task Given_RentalsTypeFilter_When_BrowseIsInvoked_Then_ReturnsOnlyRentalListings()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(null, ListingKind.Rentals, null, 1, 20, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(data.ApartmentListing.Id);
        paged.Items.Single().Type.Should().Be("Apartment");
    }

    [Test]
    public async Task Given_SearchTerm_When_BrowseIsInvoked_Then_ReturnsMatchingListings()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(null, null, "sea point", 1, 20, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.TotalCount.Should().Be(1);
        paged.Items.Single().Id.Should().Be(data.RoomListing.Id);
    }

    [Test]
    public async Task Given_OutOfRangePageSize_When_BrowseIsInvoked_Then_ReturnsClampedPageSize()
    {
        // Arrange
        var (controller, _, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Browse(null, null, null, 0, 500, CancellationToken.None);

        // Assert
        var paged = Unwrap<PagedResult<ListingSummaryDto>>(result);
        paged.Page.Should().Be(1);
        paged.PageSize.Should().Be(20);
    }

    [Test]
    public async Task Given_ExistingListingId_When_GetByIdIsInvoked_Then_ReturnsOkResultWithFullDetail()
    {
        // Arrange
        var (controller, data, cache) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.GetById(data.RoomListing.Id, CancellationToken.None);

        // Assert
        var detail = Unwrap<ListingDetailDto>(result);
        detail.Id.Should().Be(data.RoomListing.Id);
        detail.Title.Should().Be("Sunny room in Sea Point");
        detail.Type.Should().Be("Room");
        detail.Owner.FirstName.Should().Be("Alice");
        detail.Address.Suburb.Should().Be("Sea Point");
        detail.Address.Province.Name.Should().Be("Western Cape");
        detail.Images.Should().Contain("https://example.com/room.jpg");

        await cache.Received(1).GetOrSetAsync<ListingDetailDto>(
            Arg.Is<string>(key => key == $"listings:detail:{data.RoomListing.Id}"),
            Arg.Any<Func<CancellationToken, Task<ListingDetailDto>>>(),
            Arg.Any<TimeSpan>(),
            Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Given_MissingListingId_When_GetByIdIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _) = await CreateSystemUnderTestAsync();
        Func<Task> act = () => controller.GetById(Guid.NewGuid(), CancellationToken.None);

        // Act & Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_NoFilters_When_ServiceBrowseIsInvoked_Then_ReturnsAllActiveListings()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var result = await service.BrowseAsync(new ListingQuery(null, null, null, 1, 20));

        // Assert
        result.TotalCount.Should().Be(2);
        result.Items.Select(i => i.Id).Should().BeEquivalentTo([data.ApartmentListing.Id, data.RoomListing.Id]);
    }

    [Test]
    public async Task Given_ProvinceFilter_When_ServiceBrowseIsInvoked_Then_ReturnsOnlyListingsInThatProvince()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var result = await service.BrowseAsync(new ListingQuery(data.WesternCape.Id, null, null, 1, 20));

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.Single().Id.Should().Be(data.RoomListing.Id);
    }

    [Test]
    public async Task Given_RoommateKindFilter_When_ServiceBrowseIsInvoked_Then_ReturnsOnlyRoommateListings()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var result = await service.BrowseAsync(new ListingQuery(null, ListingKind.Roommate, null, 1, 20));

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.Single().Id.Should().Be(data.RoomListing.Id);
        result.Items.Single().Type.Should().Be("Room");
    }

    [Test]
    public async Task Given_RentalsKindFilter_When_ServiceBrowseIsInvoked_Then_ReturnsOnlyRentalListings()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var result = await service.BrowseAsync(new ListingQuery(null, ListingKind.Rentals, null, 1, 20));

        // Assert
        result.Items.Single().Id.Should().Be(data.ApartmentListing.Id);
        result.Items.Single().Type.Should().Be("Apartment");
    }

    [Test]
    public async Task Given_SearchTerm_When_ServiceBrowseIsInvoked_Then_MatchesTitleSuburbAndOwnerName()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var byTitle = await service.BrowseAsync(new ListingQuery(null, null, "sea point", 1, 20));
        var bySuburb = await service.BrowseAsync(new ListingQuery(null, null, "sandton", 1, 20));
        var byOwner = await service.BrowseAsync(new ListingQuery(null, null, "bob jones", 1, 20));

        // Assert
        byTitle.Items.Single().Id.Should().Be(data.RoomListing.Id);
        bySuburb.Items.Single().Id.Should().Be(data.ApartmentListing.Id);
        byOwner.Items.Single().Id.Should().Be(data.ApartmentListing.Id);
    }

    [Test]
    public async Task Given_PageSize_When_ServiceBrowseIsInvoked_Then_PaginatesResults()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var first = await service.BrowseAsync(new ListingQuery(null, null, null, 1, 1));
        var second = await service.BrowseAsync(new ListingQuery(null, null, null, 2, 1));

        // Assert
        first.TotalCount.Should().Be(2);
        first.TotalPages.Should().Be(2);
        first.Items.Single().Id.Should().Be(data.ApartmentListing.Id);
        second.Items.Single().Id.Should().Be(data.RoomListing.Id);
    }

    [Test]
    public async Task Given_InvalidPagination_When_ServiceBrowseIsInvoked_Then_NormalizesPageAndPageSize()
    {
        // Arrange
        var (service, _, _) = CreateServiceUnderTestAsync();

        // Act
        var result = await service.BrowseAsync(new ListingQuery(null, null, null, 0, 500));

        // Assert
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(20);
    }

    [Test]
    public async Task Given_RepeatedBrowseQuery_When_ServiceBrowseIsInvoked_Then_ResultsAreCachedPerQuery()
    {
        // Arrange
        var (service, accessor, _) = CreateServiceUnderTestAsync();
        var query = new ListingQuery(null, null, null, 1, 20);

        // Act
        await service.BrowseAsync(query);
        await service.BrowseAsync(query);

        // Assert
        accessor.BrowseCalls.Should().Be(1);

        // Act
        var other = new ListingQuery(null, null, "search", 1, 20);
        await service.BrowseAsync(other);
        await service.BrowseAsync(other);

        // Assert
        accessor.BrowseCalls.Should().Be(2);
    }

    [Test]
    public async Task Given_ExistingListing_When_ServiceGetByIdIsInvoked_Then_ReturnsFullDetail()
    {
        // Arrange
        var (service, _, data) = CreateServiceUnderTestAsync();

        // Act
        var detail = await service.GetByIdAsync(data.RoomListing.Id);

        // Assert
        detail.Id.Should().Be(data.RoomListing.Id);
        detail.Type.Should().Be("Room");
        detail.Price.Should().Be(7500);
        detail.Owner.FirstName.Should().Be("Alice");
        detail.Owner.LastName.Should().Be("Smith");
        detail.Address.Suburb.Should().Be("Sea Point");
        detail.Address.Province.Name.Should().Be("Western Cape");
        detail.Images.Should().Contain("https://example.com/room.jpg");
        detail.PrimaryImageUrl.Should().Be("https://example.com/room.jpg");
    }

    [Test]
    public async Task Given_MissingListing_When_ServiceGetByIdIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (service, _, _) = CreateServiceUnderTestAsync();
        Func<Task> act = () => service.GetByIdAsync(Guid.NewGuid());

        // Act & Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_RepeatedDetailRequest_When_ServiceGetByIdIsInvoked_Then_ResultsAreCached()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();

        // Act
        await service.GetByIdAsync(data.RoomListing.Id);
        await service.GetByIdAsync(data.RoomListing.Id);

        // Assert
        accessor.DetailCalls.Should().Be(1);
    }

    private static async Task<(ListingsController Controller, TestData Data, ICache Cache)> CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var cache = Substitute.For<ICache>();
        ConfigureCachePassthrough<PagedResult<ListingSummaryDto>>(cache);
        ConfigureCachePassthrough<ListingDetailDto>(cache);

        var service = new ListingService(
            new ListingAccessor(db),
            cache,
            NullLogger<ListingService>.Instance);

        return (new ListingsController(service), data, cache);
    }

    private static (ListingService Service, CountingListingAccessor Accessor, TestData Data) CreateServiceUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        data.SeedAsync(db).GetAwaiter().GetResult();

        var accessor = new CountingListingAccessor(new ListingAccessor(db));
        var service = new ListingService(
            accessor,
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            NullLogger<ListingService>.Instance);

        return (service, accessor, data);
    }

    private static void ConfigureCachePassthrough<T>(ICache cache)
    {
        cache.GetOrSetAsync(
                Arg.Any<string>(),
                Arg.Any<Func<CancellationToken, Task<T>>>(),
                Arg.Any<TimeSpan>(),
                Arg.Any<CancellationToken>())
            .Returns(async callInfo =>
            {
                var factory = callInfo.Arg<Func<CancellationToken, Task<T>>>()!;
                return await factory(CancellationToken.None);
            });
    }

    private static T Unwrap<T>(ActionResult<T> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<T>();
        return (T)ok.Value!;
    }

    private sealed class CountingListingAccessor(IListingAccessor inner) : IListingAccessor
    {
        public int BrowseCalls { get; private set; }

        public int DetailCalls { get; private set; }

        public async Task<(IReadOnlyList<Listing> Items, int TotalCount)> BrowseAsync(ListingQuery query, CancellationToken ct = default)
        {
            BrowseCalls++;
            return await inner.BrowseAsync(query, ct);
        }

        public async Task<Listing?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            DetailCalls++;
            return await inner.GetByIdAsync(id, ct);
        }
    }
}
