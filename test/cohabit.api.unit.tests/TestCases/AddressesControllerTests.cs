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
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class AddressesControllerTests
{
    [Test]
    public async Task Given_ExistingAddress_When_GetByIdIsInvoked_Then_ReturnsAddressDto()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.GetById(data.WcAddress.Id, CancellationToken.None);

        // Assert
        var address = Unwrap<AddressDto>(result);
        address.Suburb.Should().Be("Sea Point");
        address.Province.Id.Should().Be(data.WesternCape.Id);
        address.Province.Name.Should().Be("Western Cape");
    }

    [Test]
    public async Task Given_MissingAddress_When_GetByIdIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.GetById(Guid.NewGuid(), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "address_not_found");
    }

    [Test]
    public async Task Given_SuburbSearch_When_SearchIsInvoked_Then_ReturnsMatchingAddresses()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Search("sea", null, CancellationToken.None);

        // Assert
        var addresses = Unwrap<IReadOnlyList<AddressDto>>(result);
        addresses.Select(a => a.Id).Should().BeEquivalentTo([data.WcAddress.Id]);
    }

    [Test]
    public async Task Given_ProvinceFilter_When_SearchIsInvoked_Then_ReturnsOnlyThatProvincesAddresses()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Search(null, data.Gauteng.Id, CancellationToken.None);

        // Assert
        var addresses = Unwrap<IReadOnlyList<AddressDto>>(result);
        addresses.Select(a => a.Id).Should().BeEquivalentTo([data.GpAddress.Id]);
    }

    [Test]
    public async Task Given_ValidRequest_When_CreateIsInvoked_Then_ReturnsCreatedWithAddressDto()
    {
        // Arrange
        var (controller, db, data) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.Create(CreateAddressRequest(data), CancellationToken.None);

        // Assert
        var address = UnwrapCreated<AddressDto>(result);
        address.Suburb.Should().Be("Durbanville");
        address.Province.Name.Should().Be("Western Cape");
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        db.Addresses.Any(a => a.Id == address.Id).Should().BeTrue();
    }

    [Test]
    public async Task Given_MissingProvince_When_CreateIsInvoked_Then_ThrowsValidationException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();
        var request = CreateAddressRequest(data) with { ProvinceId = 999 };

        // Act & Assert
        Func<Task> act = () => controller.Create(request, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .Where(ex => ex.ErrorCode == "province_not_found");
    }

    [Test]
    public async Task Given_ExistingAddress_When_UpdateIsInvoked_Then_ReturnsUpdatedAddressDto()
    {
        // Arrange
        var (controller, db, data) = await CreateSystemUnderTestAsync();
        var request = new UpdateAddressRequest("10 New Rd", "Unit 2", "New Town", "2001", data.Gauteng.Id);

        // Act
        var result = await controller.Update(data.WcAddress.Id, request, CancellationToken.None);

        // Assert
        var address = Unwrap<AddressDto>(result);
        address.Suburb.Should().Be("New Town");
        address.Province.Id.Should().Be(data.Gauteng.Id);

        var stored = db.Addresses.First(a => a.Id == data.WcAddress.Id);
        stored.AddressLine1.Should().Be("10 New Rd");
        stored.ProvinceId.Should().Be(data.Gauteng.Id);
    }

    [Test]
    public async Task Given_MissingAddress_When_UpdateIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Update(Guid.NewGuid(), new UpdateAddressRequest("1 A", "", "Sub", "0000", data.WesternCape.Id), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "address_not_found");
    }

    [Test]
    public async Task Given_MissingProvince_When_UpdateIsInvoked_Then_ThrowsValidationException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Update(data.WcAddress.Id, new UpdateAddressRequest("1 A", "", "Sub", "0000", 999), CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .Where(ex => ex.ErrorCode == "province_not_found");
    }

    [Test]
    public async Task Given_UnusedAddress_When_DeleteIsInvoked_Then_ReturnsNoContentAndRemovesAddress()
    {
        // Arrange
        var (controller, db, data) = await CreateSystemUnderTestAsync();
        var unused = Address.Create("9 Test Ave", "", "Cape Town CBD", "8001", data.WesternCape.Id);
        db.Addresses.Add(unused);
        await db.SaveChangesAsync();

        // Act
        var result = await controller.Delete(unused.Id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        db.Addresses.Any(a => a.Id == unused.Id).Should().BeFalse();
    }

    [Test]
    public async Task Given_MissingAddress_When_DeleteIsInvoked_Then_ThrowsNotFoundException()
    {
        // Arrange
        var (controller, _, _) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Delete(Guid.NewGuid(), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == "address_not_found");
    }

    [Test]
    public async Task Given_ReferencedAddress_When_DeleteIsInvoked_Then_ThrowsConflictException()
    {
        // Arrange
        var (controller, _, data) = await CreateSystemUnderTestAsync();

        // Act & Assert
        Func<Task> act = () => controller.Delete(data.WcAddress.Id, CancellationToken.None);
        await act.Should().ThrowAsync<ConflictException>()
            .Where(ex => ex.ErrorCode == "address_in_use");
    }

    [Test]
    public async Task Given_RepeatedSearch_When_ServiceSearchIsInvoked_Then_ResultsAreCached()
    {
        // Arrange
        var (service, accessor, _) = CreateServiceUnderTestAsync();
        var query = new AddressQuery(null, null);

        // Act
        await service.SearchAsync(query);
        await service.SearchAsync(query);

        // Assert
        accessor.SearchCalls.Should().Be(1);
    }

    [Test]
    public async Task Given_CreateAddress_When_ServiceCreateIsInvoked_Then_SearchCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        await service.SearchAsync(new AddressQuery(null, null));
        accessor.SearchCalls.Should().Be(1);

        // Act
        await service.CreateAsync(CreateAddressRequest(data));

        // Assert
        var refreshed = await service.SearchAsync(new AddressQuery(null, null));
        accessor.SearchCalls.Should().Be(2);
        refreshed.Select(a => a.Suburb).Should().Contain("Durbanville");
    }

    [Test]
    public async Task Given_UpdateAddress_When_ServiceUpdateIsInvoked_Then_DetailCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        var before = await service.GetByIdAsync(data.WcAddress.Id);
        before.Suburb.Should().Be("Sea Point");
        accessor.GetByIdCalls.Should().Be(1);

        // Act
        await service.UpdateAsync(data.WcAddress.Id, new UpdateAddressRequest("10 New Rd", "Unit 2", "New Town", "2001", data.Gauteng.Id));

        // Assert
        var after = await service.GetByIdAsync(data.WcAddress.Id);
        after.Suburb.Should().Be("New Town");
        accessor.GetByIdCalls.Should().Be(2);
    }

    [Test]
    public async Task Given_DeleteAddress_When_ServiceDeleteIsInvoked_Then_DetailCacheIsRefreshed()
    {
        // Arrange
        var (service, accessor, data) = CreateServiceUnderTestAsync();
        var addressDto = await service.CreateAsync(CreateAddressRequest(data));
        accessor.CreateCalls.Should().Be(1);
        await service.GetByIdAsync(addressDto.Id);
        accessor.GetByIdCalls.Should().Be(1);

        // Act
        await service.DeleteAsync(addressDto.Id);

        // Assert
        Func<Task> act = () => service.GetByIdAsync(addressDto.Id);
        await act.Should().ThrowAsync<NotFoundException>();
        accessor.GetByIdCalls.Should().Be(2);
    }

    private static async Task<(AddressesController Controller, CohabitDbContext Db, TestData Data)> CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var service = new AddressService(
            new AddressAccessor(db),
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            NullLogger<AddressService>.Instance);

        return (new AddressesController(service), db, data);
    }

    private static (AddressService Service, CountingAddressAccessor Accessor, TestData Data) CreateServiceUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        data.SeedAsync(db).GetAwaiter().GetResult();

        var accessor = new CountingAddressAccessor(new AddressAccessor(db));
        var service = new AddressService(
            accessor,
            new InMemoryCache(new MemoryCache(new MemoryCacheOptions())),
            NullLogger<AddressService>.Instance);

        return (service, accessor, data);
    }

    private static CreateAddressRequest CreateAddressRequest(TestData data)
    {
        return new CreateAddressRequest(
            "12 Koeberg Rd",
            "Unit 5",
            "Durbanville",
            "7550",
            data.WesternCape.Id);
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
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var created = (CreatedAtActionResult)result.Result!;
        created.Value!.Should().BeAssignableTo<T>();
        return (T)created.Value!;
    }
}
