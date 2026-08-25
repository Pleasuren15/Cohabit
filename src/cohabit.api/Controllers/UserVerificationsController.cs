using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

/// <summary>
///     Identity-document verification for the authenticated user. Images are
///     stored in the private document store and reviewed manually by an
///     administrator.
/// </summary>
[ApiController]
[Route("api/users/me/verifications")]
[Authorize]
public class UserVerificationsController(IVerificationService verificationService) : ControllerBase
{
    /// <summary>
    ///     Submit ID pictures for manual review. Accepts multipart form data with a
    ///     <c>type</c> field (identity_document, passport or drivers_license), a
    ///     required <c>frontImage</c>, required <c>selfieImage</c>, and an optional <c>backImage</c>.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(VerificationService.MaxUploadSizeBytes)]
    public async Task<ActionResult<UserVerificationDto>> Submit(
        [FromForm] string type,
        [FromForm] IFormFile frontImage,
        [FromForm] IFormFile? selfieImage,
        [FromForm] IFormFile? backImage,
        CancellationToken ct = default)
    {
        if (!AuthController.TryGetProfile(User, out var profile))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unable to identify the user from the token"
            });
        }

        var verification = await verificationService.SubmitAsync(
            profile.UserId, type, frontImage, backImage, selfieImage, ct);

        return CreatedAtAction(nameof(GetMine), new { }, verification);
    }

    /// <summary>
    ///     List the caller's own verification submissions, newest first. Image URLs
    ///     are short-lived signed links.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserVerificationDto>>> GetMine(CancellationToken ct = default)
    {
        if (!AuthController.TryGetProfile(User, out var profile))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unable to identify the user from the token"
            });
        }

        var verifications = await verificationService.GetMineAsync(profile.UserId, ct);
        return Ok(verifications);
    }
}
