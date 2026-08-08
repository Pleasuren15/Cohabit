using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using System.Net;
using System.Net.Http.Json;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class UsersControllerTests : ApiTestBase
{
    [Test]
    public async Task Given_ValidRequest_When_CreateIsInvoked_Then_ReturnsCreatedUser()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();
        var request = new CreateUserRequest(
            "Alice", "Smith", "0812345678", "alice@example.com", DateOnly.Parse("1995-01-01"), 'F', null, address.Id);

        // Act
        var response = await Client.PostAsJsonAsync("/api/users", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        user!.Id.Should().NotBeEmpty();
        user.FirstName.Should().Be("Alice");
        user.LastName.Should().Be("Smith");
        user.Email.Should().Be("alice@example.com");
    }

    [Test]
    public async Task Given_ExistingEmail_When_CreateIsInvoked_Then_ReturnsConflictWithErrorCode()
    {
        // Arrange
        await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0810000000");
        var address = await Data.CreateAddressAsync();
        var request = new CreateUserRequest(
            "Bob", "Jones", "0811111111", "ALICE@example.com", DateOnly.Parse("1992-05-05"), 'M', null, address.Id);

        // Act
        var response = await Client.PostAsJsonAsync("/api/users", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("email_in_use");
    }

    [Test]
    public async Task Given_ExistingCellphone_When_CreateIsInvoked_Then_ReturnsConflictWithErrorCode()
    {
        // Arrange
        await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var address = await Data.CreateAddressAsync();
        var request = new CreateUserRequest(
            "Bob", "Jones", "0812345678", "bob@example.com", DateOnly.Parse("1992-05-05"), 'M', null, address.Id);

        // Act
        var response = await Client.PostAsJsonAsync("/api/users", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("cellphone_in_use");
    }

    [Test]
    public async Task Given_InvalidGender_When_CreateIsInvoked_Then_ReturnsBadRequestWithErrorCode()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();
        var request = new CreateUserRequest(
            "Alice", "Smith", "0812345678", "alice@example.com", DateOnly.Parse("1995-01-01"), 'X', null, address.Id);

        // Act
        var response = await Client.PostAsJsonAsync("/api/users", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("gender_invalid");
    }

    [Test]
    public async Task Given_UnknownAddress_When_CreateIsInvoked_Then_ReturnsBadRequestWithErrorCode()
    {
        // Arrange
        var request = new CreateUserRequest(
            "Alice", "Smith", "0812345678", "alice@example.com", DateOnly.Parse("1995-01-01"), 'F', null, Guid.NewGuid());

        // Act
        var response = await Client.PostAsJsonAsync("/api/users", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("address_not_found");
    }

    [Test]
    public async Task Given_SeededUsers_When_GetAllIsInvoked_Then_ReturnsAllUsers()
    {
        // Arrange
        await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", firstName: "Bob", gender: 'M');

        // Act
        var response = await Client.GetAsync("/api/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();
        users!.Select(u => u.Email).Should().Contain(["alice@example.com", "bob@example.com"]);
    }

    [Test]
    public async Task Given_ExistingUser_When_UpdateIsInvoked_Then_ReturnsUpdatedUser()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();
        var user = await Data.CreateUserAsync(addressId: address.Id);
        var request = new UpdateUserRequest(
            "Alice", "Jones", "0812345678", "alice@example.com", DateOnly.Parse("1995-01-01"), 'F', "Updated bio", address.Id);

        // Act
        var response = await Client.PutAsJsonAsync($"/api/users/{user.Id}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<UserDto>();
        updated!.Id.Should().Be(user.Id);
        updated.LastName.Should().Be("Jones");
        updated.Bio.Should().Be("Updated bio");
    }

    [Test]
    public async Task Given_UnknownUser_When_UpdateIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var address = await Data.CreateAddressAsync();
        var request = new UpdateUserRequest(
            "Alice", "Jones", "0812345678", "alice@example.com", DateOnly.Parse("1995-01-01"), 'F', null, address.Id);

        // Act
        var response = await Client.PutAsJsonAsync($"/api/users/{Guid.NewGuid()}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("user_not_found");
    }

    [Test]
    public async Task Given_ExistingUser_When_DeleteIsInvoked_Then_ReturnsNoContentAndRemovesUser()
    {
        // Arrange
        var user = await Data.CreateUserAsync(email: "delete@example.com", cellphone: "0820000000");

        // Act
        var response = await Client.DeleteAsync($"/api/users/{user.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await Client.GetAsync("/api/users");
        var users = await getResponse.Content.ReadFromJsonAsync<List<UserDto>>();
        users.Should().NotContain(u => u.Id == user.Id);
    }

    [Test]
    public async Task Given_UnknownUser_When_DeleteIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange

        // Act
        var response = await Client.DeleteAsync($"/api/users/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("user_not_found");
    }

    [Test]
    public async Task Given_UserWithListings_When_GetUserListingsIsInvoked_Then_ReturnsOnlyThatUsersListings()
    {
        // Arrange
        var alice = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var bob = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        await Data.CreateListingAsync(alice, title: "Alice's room");
        var bobListing = await Data.CreateListingAsync(bob, title: "Bob's apartment", listingTypeName: "Apartment", suburb: "Sandton", provinceName: "Gauteng", price: 15000);

        // Act
        var response = await Client.GetAsync($"/api/users/{bob.Id}/listings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var listings = await response.Content.ReadFromJsonAsync<List<ListingSummaryDto>>();
        listings.Should().ContainSingle().Which.Id.Should().Be(bobListing.Id);
        listings.Single().Title.Should().Be("Bob's apartment");
    }

    [Test]
    public async Task Given_OwnedListing_When_DeleteListingIsInvoked_Then_ReturnsNoContent()
    {
        // Arrange
        var owner = await Data.CreateUserAsync();
        var listing = await Data.CreateListingAsync(owner);

        // Act
        var response = await Client.DeleteAsync($"/api/users/{owner.Id}/listings/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await Client.GetAsync($"/api/listings/{listing.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Given_NonOwner_When_DeleteListingIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var otherUser = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        var listing = await Data.CreateListingAsync(owner);

        // Act
        var response = await Client.DeleteAsync($"/api/users/{otherUser.Id}/listings/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("listing_not_found");
    }

    [Test]
    public async Task Given_ExistingUserAndListing_When_AddFavoriteIsInvoked_Then_ReturnsCreatedFavorite()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');

        // Act
        var response = await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var favorite = await response.Content.ReadFromJsonAsync<FavoriteDto>();
        favorite!.UserId.Should().Be(user.Id);
        favorite.ListingId.Should().Be(listing.Id);
    }

    [Test]
    public async Task Given_AlreadyFavoritedListing_When_AddFavoriteIsInvoked_Then_ReturnsConflictWithErrorCode()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Act
        var response = await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("already_favorited");
    }

    [Test]
    public async Task Given_FavoritedListings_When_GetFavoritesIsInvoked_Then_ReturnsThoseListings()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner, title: "Sunny room in Sea Point");
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Act
        var response = await Client.GetAsync($"/api/users/{user.Id}/favorites");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var favorites = await response.Content.ReadFromJsonAsync<List<ListingSummaryDto>>();
        favorites.Should().ContainSingle().Which.Id.Should().Be(listing.Id);
    }

    [Test]
    public async Task Given_FavoritedListing_When_IsFavoriteIsInvoked_Then_ReturnsTrue()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Act
        var response = await Client.GetAsync($"/api/users/{user.Id}/favorites/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var isFavorite = await response.Content.ReadFromJsonAsync<bool>();
        isFavorite.Should().BeTrue();
    }

    [Test]
    public async Task Given_NotFavoritedListing_When_IsFavoriteIsInvoked_Then_ReturnsFalse()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');

        // Act
        var response = await Client.GetAsync($"/api/users/{user.Id}/favorites/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var isFavorite = await response.Content.ReadFromJsonAsync<bool>();
        isFavorite.Should().BeFalse();
    }

    [Test]
    public async Task Given_FavoritedListing_When_RemoveFavoriteIsInvoked_Then_ReturnsNoContentAndRemovesFavorite()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');
        await Client.PostAsJsonAsync($"/api/users/{user.Id}/favorites", new AddFavoriteRequest(listing.Id));

        // Act
        var response = await Client.DeleteAsync($"/api/users/{user.Id}/favorites/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var isFavoriteResponse = await Client.GetAsync($"/api/users/{user.Id}/favorites/{listing.Id}");
        var isFavorite = await isFavoriteResponse.Content.ReadFromJsonAsync<bool>();
        isFavorite.Should().BeFalse();
    }

    [Test]
    public async Task Given_NotFavoritedListing_When_RemoveFavoriteIsInvoked_Then_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var owner = await Data.CreateUserAsync(email: "alice@example.com", cellphone: "0812345678");
        var listing = await Data.CreateListingAsync(owner);
        var user = await Data.CreateUserAsync(email: "bob@example.com", cellphone: "0811111111", gender: 'M');

        // Act
        var response = await Client.DeleteAsync($"/api/users/{user.Id}/favorites/{listing.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("favorite_not_found");
    }
}
