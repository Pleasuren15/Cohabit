using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using cohabit.application.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class FavoritesControllerTests
{
    [Test]
    public async Task Given_ValidListing_When_AddFavoriteIsInvoked_Then_ReturnsCreatedWithFavoriteDto()
    {
        // Arrange
        var (controller, db, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.AddFavorite(
            data.Alice.Id,
            new AddFavoriteRequest(data.ApartmentListing.Id),
            CancellationToken.None);

        // Assert
        var favorite = UnwrapCreated<FavoriteDto>(result);
        favorite.UserId.Should().Be(data.Alice.Id);
        favorite.ListingId.Should().Be(data.ApartmentListing.Id);
        result.Result.Should().BeOfType<CreatedResult>();
        ((CreatedResult)result.Result!).Location.Should()
            .Be($"/api/users/{data.Alice.Id}/favorites/{data.ApartmentListing.Id}");
        db.WatchLists.Any(w => w.UserId == data.Alice.Id && w.ListingId == data.ApartmentListing.Id).Should().BeTrue();
    }

    [Test]
    public async Task Given_AlreadyFavorited_When_AddFavoriteIsInvoked_Then_ThrowsConflictException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();
        await controller.AddFavorite(data.Alice.Id, new AddFavoriteRequest(data.ApartmentListing.Id), CancellationToken.None);

        // Act & Assert
        Func<Task> act = () => controller.AddFavorite(
            data.Alice.Id,
            new AddFavoriteRequest(data.ApartmentListing.Id),
            CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .Where(ex => ex.ErrorCode == "already_favorited");
    }

    [Test]
    public async Task Given_MissingUser_When_AddFavoriteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.AddFavorite(
            Guid.NewGuid(),
            new AddFavoriteRequest(data.ApartmentListing.Id),
            CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_MissingListing_When_AddFavoriteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.AddFavorite(
            data.Alice.Id,
            new AddFavoriteRequest(Guid.NewGuid()),
            CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_FavoritedListings_When_GetFavoritesIsInvoked_Then_ReturnsOnlyThoseListings()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();
        await controller.AddFavorite(data.Alice.Id, new AddFavoriteRequest(data.RoomListing.Id), CancellationToken.None);
        await controller.AddFavorite(data.Alice.Id, new AddFavoriteRequest(data.ApartmentListing.Id), CancellationToken.None);

        // Act
        var result = await controller.GetFavorites(data.Alice.Id, CancellationToken.None);

        // Assert
        var favorites = Unwrap<IReadOnlyList<ListingSummaryDto>>(result);
        favorites.Select(l => l.Id).Should().BeEquivalentTo([data.RoomListing.Id, data.ApartmentListing.Id]);
        favorites.Should().OnlyContain(l => l.Owner.FirstName == "Alice" || l.Owner.FirstName == "Bob");
        favorites.First(l => l.Id == data.RoomListing.Id).PrimaryImageUrl.Should().Be("https://example.com/room.jpg");
    }

    [Test]
    public async Task Given_MissingUser_When_GetFavoritesIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.GetFavorites(Guid.NewGuid(), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_FavoritedListing_When_IsFavoriteIsInvoked_Then_ReturnsTrue()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();
        await controller.AddFavorite(data.Alice.Id, new AddFavoriteRequest(data.RoomListing.Id), CancellationToken.None);

        // Act
        var result = await controller.IsFavorite(data.Alice.Id, data.RoomListing.Id, CancellationToken.None);

        // Assert
        Unwrap<bool>(result).Should().BeTrue();
    }

    [Test]
    public async Task Given_NotFavoritedListing_When_IsFavoriteIsInvoked_Then_ReturnsFalse()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.IsFavorite(data.Alice.Id, data.ApartmentListing.Id, CancellationToken.None);

        // Assert
        Unwrap<bool>(result).Should().BeFalse();
    }

    [Test]
    public async Task Given_MissingUser_When_IsFavoriteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.IsFavorite(Guid.NewGuid(), data.RoomListing.Id, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_FavoritedListing_When_RemoveFavoriteIsInvoked_Then_ReturnsNoContentAndRemovesRow()
    {
        // Arrange
        var (controller, db, data) = await CreateSystemUnderTestAsync();
        await controller.AddFavorite(data.Alice.Id, new AddFavoriteRequest(data.RoomListing.Id), CancellationToken.None);

        // Act
        var result = await controller.RemoveFavorite(data.Alice.Id, data.RoomListing.Id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        db.WatchLists.Any(w => w.UserId == data.Alice.Id && w.ListingId == data.RoomListing.Id).Should().BeFalse();
    }

    [Test]
    public async Task Given_NotFavoritedListing_When_RemoveFavoriteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.RemoveFavorite(data.Alice.Id, data.ApartmentListing.Id, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "favorite_not_found");
    }

    [Test]
    public async Task Given_MissingUser_When_RemoveFavoriteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.RemoveFavorite(Guid.NewGuid(), data.RoomListing.Id, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_RepeatedFavoritesRequest_When_ServiceGetFavoritesIsInvoked_Then_ResultsAreCached()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();

        // Act
        await service.GetUserFavoritesAsync(data.Alice.Id);
        await service.GetUserFavoritesAsync(data.Alice.Id);

        // Assert
        accessor.GetUserFavoritesCalls.Should().Be(1);
    }

    [Test]
    public async Task Given_AddFavorite_When_ServiceAddIsInvoked_Then_FavoritesCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        await service.GetUserFavoritesAsync(data.Alice.Id);
        accessor.GetUserFavoritesCalls.Should().Be(1);

        // Act
        await service.AddAsync(data.Alice.Id, data.ApartmentListing.Id);

        // Assert
        var refreshed = await service.GetUserFavoritesAsync(data.Alice.Id);
        accessor.GetUserFavoritesCalls.Should().Be(2);
        refreshed.Select(l => l.Id).Should().Contain(data.ApartmentListing.Id);
    }

    [Test]
    public async Task Given_RemoveFavorite_When_ServiceRemoveIsInvoked_Then_FavoritesCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        await service.AddAsync(data.Alice.Id, data.RoomListing.Id);
        await service.GetUserFavoritesAsync(data.Alice.Id);
        accessor.GetUserFavoritesCalls.Should().Be(1);

        // Act
        await service.RemoveAsync(data.Alice.Id, data.RoomListing.Id);

        // Assert
        var refreshed = await service.GetUserFavoritesAsync(data.Alice.Id);
        accessor.GetUserFavoritesCalls.Should().Be(2);
        refreshed.Select(l => l.Id).Should().NotContain(data.RoomListing.Id);
    }

    private static async Task<(UsersController Controller, CohabitDbContext Db, TestData Data)> CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var cache = new InMemoryCache(new MemoryCache(new MemoryCacheOptions()));
        var listingService = new ListingService(
            new ListingAccessor(db),
            cache,
            new FakeImageStorage(),
            new FakeSystemMessagingService(),
            NullLogger<ListingService>.Instance);
        var userService = new UserService(
            new UserAccessor(db),
            cache,
            new FakeSystemMessagingService(),
            NullLogger<UserService>.Instance);
        var watchListService = new WatchListService(
            new WatchListAccessor(db),
            new FakeMessagingAccessor(),
            cache,
            new FakeSystemMessagingService(),
            NullLogger<WatchListService>.Instance);

        return (new UsersController(
            listingService,
            userService,
            watchListService,
            new FakeSystemMessagingService()), db, data);
    }

    private static (WatchListService Service, CountingWatchListAccessor Accessor, TestData Data) CreateServiceUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        data.SeedAsync(db).GetAwaiter().GetResult();

        var accessor = new CountingWatchListAccessor(new WatchListAccessor(db));
        var service = new WatchListService(
            accessor,
            new FakeMessagingAccessor(),
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            new FakeSystemMessagingService(),
            NullLogger<WatchListService>.Instance);

        return (service, accessor, data);
    }

    private static T Unwrap<T>(ActionResult<T> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<T>();
        return (T)ok.Value!;
    }

    private static T UnwrapCreated<T>(ActionResult<T> result)
    {
        result.Result.Should().BeOfType<CreatedResult>();
        var created = (CreatedResult)result.Result!;
        created.Value!.Should().BeAssignableTo<T>();
        return (T)created.Value!;
    }
}
