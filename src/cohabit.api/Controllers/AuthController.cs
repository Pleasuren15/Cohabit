using cohabit.api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    ///     Syncs the authenticated user's profile from the JWT into the users table.
    ///     Extracts firstname, lastname, dateofbirth, and gender from the JWT claims.
    ///     Other fields (cellphone, email, bio, address) can be updated later.
    /// </summary>
    [HttpPost("sync")]
    [Authorize]
    public async Task<IActionResult> Sync(CancellationToken ct)
    {
        try
        {
            var user = await authService.SyncUserFromJwt(ct);
            return Ok(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.DateOfBirth,
                user.Gender
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "An unexpected error occurred",
                detail: ex.Message);
        }
    }
}