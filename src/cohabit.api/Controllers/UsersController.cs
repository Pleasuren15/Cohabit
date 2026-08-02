using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IListingService listingService, IUserService userService) : ControllerBase
{
    /// <summary>
    ///     Create a user with a full profile. Email and cellphone must be unique.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(
        [FromBody] CreateUserRequest request,
        CancellationToken ct = default)
    {
        var user = await userService.CreateAsync(request, ct);
        return Created($"/api/users/{user.Id}", user);
    }

    /// <summary>
    ///     List all users, ordered by name.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetAll(CancellationToken ct = default)
    {
        var users = await userService.GetAllAsync(ct);
        return Ok(users);
    }

    /// <summary>
    ///     Update a user profile. Email and cellphone must stay unique.
    /// </summary>
    [HttpPut("{userId:guid}")]
    public async Task<ActionResult<UserDto>> Update(
        Guid userId,
        [FromBody] UpdateUserRequest request,
        CancellationToken ct = default)
    {
        var user = await userService.UpdateAsync(userId, request, ct);
        return Ok(user);
    }

    /// <summary>
    ///     Delete a user.
    /// </summary>
    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> Delete(Guid userId, CancellationToken ct = default)
    {
        await userService.DeleteAsync(userId, ct);
        return NoContent();
    }

    /// <summary>
    ///     List all listings owned by a user, newest first.
    /// </summary>
    [HttpGet("{userId:guid}/listings")]
    public async Task<ActionResult<IReadOnlyList<ListingSummaryDto>>> GetListings(
        Guid userId,
        CancellationToken ct = default)
    {
        var listings = await listingService.GetUserListingsAsync(userId, ct);
        return Ok(listings);
    }

    /// <summary>
    ///     Update a listing owned by the user. Images are left untouched.
    /// </summary>
    [HttpPut("{userId:guid}/listings/{listingId:guid}")]
    public async Task<ActionResult<ListingDetailDto>> Update(
        Guid userId,
        Guid listingId,
        [FromBody] UpdateListingRequest request,
        CancellationToken ct = default)
    {
        var listing = await listingService.UpdateAsync(userId, listingId, request, ct);
        return Ok(listing);
    }

    /// <summary>
    ///     Delete a listing owned by the user.
    /// </summary>
    [HttpDelete("{userId:guid}/listings/{listingId:guid}")]
    public async Task<IActionResult> Delete(Guid userId, Guid listingId, CancellationToken ct = default)
    {
        await listingService.DeleteAsync(userId, listingId, ct);
        return NoContent();
    }
}
