using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using cohabit.application.Data;
using cohabit.application.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class UsersControllerTests
{
    [Test]
    public async Task Given_UserWithListings_When_GetListingsIsInvoked_Then_ReturnsOnlyThatUsersListings()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var aliceResult = await controller.GetListings(data.Alice.Id, CancellationToken.None);
        var bobResult = await controller.GetListings(data.Bob.Id, CancellationToken.None);

        // Assert
        var alice = Unwrap<IReadOnlyList<ListingSummaryDto>>(aliceResult);
        var bob = Unwrap<IReadOnlyList<ListingSummaryDto>>(bobResult);
        alice.Select(l => l.Id).Should().BeEquivalentTo([data.RoomListing.Id, data.ExpiredListing.Id]);
        alice.Should().OnlyContain(l => l.Owner.FirstName == "Alice");
        bob.Select(l => l.Id).Should().BeEquivalentTo([data.ApartmentListing.Id]);
    }

    [Test]
    public async Task Given_MissingUser_When_GetListingsIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.GetListings(Guid.NewGuid(), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_Owner_When_UpdateIsInvoked_Then_ReturnsUpdatedListing()
    {
        // Arrange
        var (controller, db, data, _) = await CreateSystemUnderTestAsync();
        var request = UpdateRequest(data);

        // Act
        var result = await controller.Update(data.Alice.Id, data.RoomListing.Id, request, CancellationToken.None);

        // Assert
        var detail = Unwrap<ListingDetailDto>(result);
        detail.Title.Should().Be("Renovated studio");
        detail.Price.Should().Be(8000);
        detail.Type.Should().Be("Apartment");
        detail.Address.Suburb.Should().Be("New Town");
        detail.Address.Province.Name.Should().Be("Gauteng");
        detail.Amenities.Should().Contain("Wi-Fi");
        detail.Rules.Should().BeEmpty();
        detail.Images.Should().Contain("https://example.com/room.jpg");

        var stored = db.Listings.First(l => l.Id == data.RoomListing.Id);
        stored.Price.Should().Be(8000);
        stored.Address.Suburb.Should().Be("New Town");
        stored.Address.ProvinceId.Should().Be(data.Gauteng.Id);
        db.ListingAmenities.Count(la => la.ListingId == data.RoomListing.Id).Should().Be(1);
        db.ListingRules.Count(lr => lr.ListingId == data.RoomListing.Id).Should().Be(0);
    }

    [Test]
    public async Task Given_NonOwner_When_UpdateIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Update(data.Bob.Id, data.RoomListing.Id, UpdateRequest(data), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_MissingListing_When_UpdateIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Update(data.Alice.Id, Guid.NewGuid(), UpdateRequest(data), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_Owner_When_DeleteIsInvoked_Then_ReturnsNoContentAndRemovesListing()
    {
        // Arrange
        var (controller, db, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Delete(data.Alice.Id, data.RoomListing.Id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        db.Listings.Any(l => l.Id == data.RoomListing.Id).Should().BeFalse();
        db.Images.Any(i => i.ListingId == data.RoomListing.Id).Should().BeFalse();
    }

    [Test]
    public async Task Given_NonOwner_When_DeleteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Delete(data.Bob.Id, data.RoomListing.Id, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "listing_not_found");
    }

    [Test]
    public async Task Given_RepeatedListingsRequest_When_ServiceGetUserListingsIsInvoked_Then_ResultsAreCached()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();

        // Act
        await service.GetUserListingsAsync(data.Alice.Id);
        await service.GetUserListingsAsync(data.Alice.Id);

        // Assert
        accessor.UserListingsCalls.Should().Be(1);
    }

    [Test]
    public async Task Given_CreateListing_When_ServiceCreateIsInvoked_Then_UserListCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(1);

        // Act
        await service.CreateAsync(CreateRequest(data), [FileFromBytes([1, 2, 3])], CancellationToken.None);

        // Assert
        var refreshed = await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(2);
        refreshed.Select(l => l.Title).Should().Contain("Cosy studio");
    }

    [Test]
    public async Task Given_UpdateListing_When_ServiceUpdateIsInvoked_Then_DetailAndListCacheAreRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        var before = await service.GetByIdAsync(data.RoomListing.Id);
        before.Price.Should().Be(7500);
        await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(1);

        // Act
        await service.UpdateAsync(data.Alice.Id, data.RoomListing.Id, UpdateRequest(data));

        // Assert
        var after = await service.GetByIdAsync(data.RoomListing.Id);
        after.Price.Should().Be(8000);
        accessor.DetailCalls.Should().Be(2);

        await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(2);
    }

    [Test]
    public async Task Given_DeleteListing_When_ServiceDeleteIsInvoked_Then_UserListCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(1);

        // Act
        await service.DeleteAsync(data.Alice.Id, data.RoomListing.Id);

        // Assert
        var refreshed = await service.GetUserListingsAsync(data.Alice.Id);
        accessor.UserListingsCalls.Should().Be(2);
        refreshed.Select(l => l.Id).Should().NotContain(data.RoomListing.Id);
    }

    [Test]
    public async Task Given_ValidRequest_When_CreateIsInvoked_Then_ReturnsCreatedWithUserDto()
    {
        // Arrange
        var (controller, db, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Create(CreateUserRequest(data), CancellationToken.None);

        // Assert
        var user = UnwrapCreated<UserDto>(result);
        user.FirstName.Should().Be("Charlie");
        user.Email.Should().Be("charlie@example.com");
        user.Cellphone.Should().Be("0812345678");
        user.IsOtpVerified.Should().BeFalse();
        result.Result.Should().BeOfType<CreatedResult>();
        ((CreatedResult)result.Result!).Location.Should().Be($"/api/users/{user.Id}");
        db.Users.Any(u => u.Id == user.Id).Should().BeTrue();
    }

    [Test]
    public async Task Given_DuplicateEmail_When_CreateIsInvoked_Then_ThrowsConflictException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();
        await controller.Create(CreateUserRequest(data), CancellationToken.None);

        // Act & Assert
        var duplicate = CreateUserRequest(data) with { Cellphone = "0898765432" };
        Func<Task> act = () => controller.Create(duplicate, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .Where(ex => ex.ErrorCode == "email_in_use");
    }

    [Test]
    public async Task Given_DuplicateCellphone_When_CreateIsInvoked_Then_ThrowsConflictException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();
        await controller.Create(CreateUserRequest(data), CancellationToken.None);

        // Act & Assert
        var duplicate = CreateUserRequest(data) with { Email = "other@example.com" };
        Func<Task> act = () => controller.Create(duplicate, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .Where(ex => ex.ErrorCode == "cellphone_in_use");
    }

    [Test]
    public async Task Given_MissingAddress_When_CreateIsInvoked_Then_ThrowsValidationException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();
        var request = CreateUserRequest(data) with { AddressId = Guid.NewGuid() };

        // Act & Assert
        Func<Task> act = () => controller.Create(request, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .Where(ex => ex.ErrorCode == "address_not_found");
    }

    [Test]
    public async Task Given_InvalidGender_When_CreateIsInvoked_Then_ThrowsValidationException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();
        var request = CreateUserRequest(data) with { Gender = 'X' };

        // Act & Assert
        Func<Task> act = () => controller.Create(request, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .Where(ex => ex.ErrorCode == "gender_invalid");
    }

    [Test]
    public async Task Given_ExistingUsers_When_GetAllIsInvoked_Then_ReturnsAllUsersOrderedByName()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.GetAll(CancellationToken.None);

        // Assert
        var users = Unwrap<IReadOnlyList<UserDto>>(result);
        users.Select(u => u.Id).Should().BeEquivalentTo([data.Alice.Id, data.Bob.Id]);
        users.Select(u => u.FirstName).Should().BeInAscendingOrder();
    }

    [Test]
    public async Task Given_ExistingUser_When_UpdateIsInvoked_Then_ReturnsUpdatedUserDto()
    {
        // Arrange
        var (controller, db, data, _) = await CreateSystemUnderTestAsync();
        var request = UpdateUserRequest(data);

        // Act
        var result = await controller.Update(data.Alice.Id, request, CancellationToken.None);

        // Assert
        var user = Unwrap<UserDto>(result);
        user.Email.Should().Be("charlie.new@example.com");
        user.Cellphone.Should().Be("0823456789");
        user.AddressId.Should().Be(data.GpAddress.Id);

        var stored = db.Users.First(u => u.Id == data.Alice.Id);
        stored.Email.Should().Be("charlie.new@example.com");
        stored.Bio.Should().Be("Updated bio");
    }

    [Test]
    public async Task Given_MissingUser_When_UpdateIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Update(Guid.NewGuid(), UpdateUserRequest(data), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_EmailOfAnotherUser_When_UpdateIsInvoked_Then_ThrowsConflictException()
    {
        // Arrange
        var (controller, _, data, _) = await CreateSystemUnderTestAsync();
        await controller.Create(CreateUserRequest(data), CancellationToken.None);

        // Act & Assert
        var request = UpdateUserRequest(data, email: "charlie@example.com");
        Func<Task> act = () => controller.Update(data.Alice.Id, request, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .Where(ex => ex.ErrorCode == "email_in_use");
    }

    [Test]
    public async Task Given_ExistingUser_When_DeleteIsInvoked_Then_ReturnsNoContentAndRemovesUser()
    {
        // Arrange
        var (controller, db, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Delete(data.Bob.Id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        db.Users.Any(u => u.Id == data.Bob.Id).Should().BeFalse();
    }

    [Test]
    public async Task Given_MissingUser_When_DeleteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Delete(Guid.NewGuid(), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "user_not_found");
    }

    [Test]
    public async Task Given_RepeatedGetAll_When_ServiceGetAllIsInvoked_Then_ResultsAreCached()
    {
        // Arrange
        var (service, accessor, _) = CreateUserServiceUnderTestAsync();

        // Act
        await service.GetAllAsync();
        await service.GetAllAsync();

        // Assert
        accessor.GetAllCalls.Should().Be(1);
    }

    [Test]
    public async Task Given_CreateUser_When_ServiceCreateIsInvoked_Then_UserListCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateUserServiceUnderTestAsync();
        await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(1);

        // Act
        await service.CreateAsync(CreateUserRequest(data));

        // Assert
        var refreshed = await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(2);
        refreshed.Select(u => u.Email).Should().Contain("charlie@example.com");
    }

    [Test]
    public async Task Given_UpdateUser_When_ServiceUpdateIsInvoked_Then_UserListCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateUserServiceUnderTestAsync();
        await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(1);

        // Act
        await service.UpdateAsync(data.Alice.Id, UpdateUserRequest(data));

        // Assert
        var refreshed = await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(2);
        refreshed.Select(u => u.Email).Should().Contain("charlie.new@example.com");
    }

    [Test]
    public async Task Given_DeleteUser_When_ServiceDeleteIsInvoked_Then_UserListCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateUserServiceUnderTestAsync();
        await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(1);

        // Act
        await service.DeleteAsync(data.Alice.Id);

        // Assert
        var refreshed = await service.GetAllAsync();
        accessor.GetAllCalls.Should().Be(2);
        refreshed.Select(u => u.Id).Should().NotContain(data.Alice.Id);
    }

    private static async Task<(UsersController Controller, CohabitDbContext Db, TestData Data, FakeImageStorage Storage)> CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var storage = new FakeImageStorage();
        var cache = new InMemoryCache(new MemoryCache(new MemoryCacheOptions()));
        var service = new ListingService(
            new ListingAccessor(db),
            cache,
            storage,
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
            service,
            userService,
            watchListService,
            new FakeSystemMessagingService()), db, data, storage);
    }

    private static (UserService Service, CountingUserAccessor Accessor, TestData Data) CreateUserServiceUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        data.SeedAsync(db).GetAwaiter().GetResult();

        var accessor = new CountingUserAccessor(new UserAccessor(db));
        var service = new UserService(
            accessor,
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            new FakeSystemMessagingService(),
            NullLogger<UserService>.Instance);

        return (service, accessor, data);
    }

    private static CreateUserRequest CreateUserRequest(TestData data, string? email = null, string? cellphone = null)
    {
        return new CreateUserRequest(
            "Charlie",
            "Brown",
            cellphone ?? "0812345678",
            email ?? "charlie@example.com",
            DateOnly.Parse("1990-03-15"),
            'M',
            "Student",
            data.WcAddress.Id);
    }

    private static UpdateUserRequest UpdateUserRequest(TestData data, string? email = null, string? cellphone = null)
    {
        return new UpdateUserRequest(
            "Charlie",
            "Brown",
            cellphone ?? "0823456789",
            email ?? "charlie.new@example.com",
            DateOnly.Parse("1990-03-15"),
            'M',
            "Updated bio",
            data.GpAddress.Id);
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
            new FakeImageStorage(),
            new FakeSystemMessagingService(),
            NullLogger<ListingService>.Instance);

        return (service, accessor, data);
    }

    private static UpdateListingRequest UpdateRequest(TestData data)
    {
        return new UpdateListingRequest(
            "Renovated studio",
            "Freshly renovated studio",
            data.Apartment.Id,
            8000,
            8000,
            2,
            1,
            DateOnly.Parse("2026-11-01"),
            "Within a day",
            "10 New Rd",
            "Unit 2",
            "New Town",
            "2001",
            data.Gauteng.Id,
            [data.Wifi.Id],
            []);
    }

    private static CreateListingRequest CreateRequest(TestData data)
    {
        return new CreateListingRequest(
            data.Alice.Id,
            "Cosy studio",
            "Bright studio near the station",
            data.Room.Id,
            6500,
            6500,
            1,
            1,
            DateOnly.Parse("2026-10-01"),
            "Within the hour",
            "5 Test Rd",
            "",
            "Test Town",
            "8000",
            data.WesternCape.Id,
            [],
            [],
            null);
    }

    private static IFormFile FileFromBytes(byte[] content, string fileName = "photo.jpg", string contentType = "image/jpeg")
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "images", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
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
