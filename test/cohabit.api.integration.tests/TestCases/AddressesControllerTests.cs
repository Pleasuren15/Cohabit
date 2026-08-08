using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using System.Net;
using System.Net.Http.Json;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class AddressesControllerTests : ApiTestBase
{
    [Test]
    public async Task Given_SeededAddresses_When_SearchIsInvoked_Then_ReturnsMatchingAddresses()
    {
        // Arrange
        await Data.CreateAddressAsync(suburb: "Sea Point");
        await Data.CreateAddressAsync(suburb: "Sandton", provinceName: "Gauteng");

        // Act
        var response = await Client.GetAsync("/api/addresses?q=sea");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var addresses = await response.Content.ReadFromJsonAsync<List<AddressDto>>();
        addresses.Should().ContainSingle().Which.Suburb.Should().Be("Sea Point");
    }

    [Test]
    public async Task Given_SeededAddresses_When_SearchWithProvinceIsInvoked_Then_ReturnsOnlyAddressesInThatProvince()
    {
        // Arrange
        await Data.CreateAddressAsync(suburb: "Sea Point");
        await Data.CreateAddressAsync(suburb: "Sandton", provinceName: "Gauteng");
        var gauteng = await Data.ProvinceByNameAsync("Gauteng");

        // Act
        var response = await Client.GetAsync($"/api/addresses?provinceId={gauteng.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var addresses = await response.Content.ReadFromJsonAsync<List<AddressDto>>();
        addresses.Should().ContainSingle().Which.Suburb.Should().Be("Sandton");
    }

    [Test]
    public async Task Given_ExistingAddress_When_GetByIdIsInvoked_Then_ReturnsAddressWithProvince()
    {
        // Arrange
        var address = await Data.CreateAddressAsync(suburb: "Sea Point");

        // Act
        var response = await Client.GetAsync($"/api/addresses/{address.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await response.Content.ReadFromJsonAsync<AddressDto>();
        dto!.Id.Should().Be(address.Id);
        dto.Suburb.Should().Be("Sea Point");
        dto.Province.Name.Should().Be("Western Cape");
    }

    [Test]
    public async Task Given_UnknownAddressId_When_GetByIdIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange

        // Act
        var response = await Client.GetAsync($"/api/addresses/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("address_not_found");
    }

    [Test]
    public async Task Given_ValidRequest_When_CreateIsInvoked_Then_ReturnsCreatedAddress()
    {
        // Arrange
        var province = await Data.ProvinceByNameAsync("Western Cape");
        var request = new CreateAddressRequest("1 Main Rd", "", "Sea Point", "8005", province.Id);

        // Act
        var response = await Client.PostAsJsonAsync("/api/addresses", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await response.Content.ReadFromJsonAsync<AddressDto>();
        dto!.Id.Should().NotBeEmpty();
        dto.Suburb.Should().Be("Sea Point");
        dto.Province.Name.Should().Be("Western Cape");
    }

    [Test]
    public async Task Given_UnknownProvince_When_CreateIsInvoked_Then_ReturnsBadRequestWithErrorCode()
    {
        // Arrange
        var request = new CreateAddressRequest("1 Main Rd", "", "Sea Point", "8005", 9999);

        // Act
        var response = await Client.PostAsJsonAsync("/api/addresses", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("province_not_found");
    }

    [Test]
    public async Task Given_ExistingAddress_When_UpdateIsInvoked_Then_ReturnsUpdatedAddress()
    {
        // Arrange
        var address = await Data.CreateAddressAsync(suburb: "Sea Point");
        var gauteng = await Data.ProvinceByNameAsync("Gauteng");
        var request = new UpdateAddressRequest("2 Fox St", "", "Sandton", "2001", gauteng.Id);

        // Act
        var response = await Client.PutAsJsonAsync($"/api/addresses/{address.Id}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await response.Content.ReadFromJsonAsync<AddressDto>();
        dto!.Id.Should().Be(address.Id);
        dto.Suburb.Should().Be("Sandton");
        dto.Province.Name.Should().Be("Gauteng");
    }

    [Test]
    public async Task Given_UnknownAddressId_When_UpdateIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var province = await Data.ProvinceByNameAsync("Western Cape");
        var request = new UpdateAddressRequest("2 Fox St", "", "Sandton", "2001", province.Id);

        // Act
        var response = await Client.PutAsJsonAsync($"/api/addresses/{Guid.NewGuid()}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("address_not_found");
    }

    [Test]
    public async Task Given_UnreferencedAddress_When_DeleteIsInvoked_Then_ReturnsNoContent()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/addresses/{address.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await Client.GetAsync($"/api/addresses/{address.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Given_ReferencedAddress_When_DeleteIsInvoked_Then_ReturnsConflictWithErrorCode()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();
        await Data.CreateUserAsync(addressId: address.Id);

        // Act
        var response = await Client.DeleteAsync($"/api/addresses/{address.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("address_in_use");
    }

    [Test]
    public async Task Given_UnknownAddressId_When_DeleteIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange

        // Act
        var response = await Client.DeleteAsync($"/api/addresses/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("address_not_found");
    }
}
