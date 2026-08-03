using System.Security.Claims;
using cohabit.comms.api.Features.Otp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace cohabit.comms.api.Controllers;

/// <summary>
///     Dispatches one-time passcodes to the authenticated user's cellphone or email.
///     The destination is resolved from the caller's JWT based on the requested channel.
/// </summary>
[ApiController]
[Route("api/otp")]
[Authorize]
public class OtpController(IOtpService otpService) : ControllerBase
{
    /// <summary>
    ///     Request an OTP. The cellphone or email is taken from the user JWT
    ///     depending on the selected channel.
    /// </summary>
    [HttpPost("request")]
    [EnableRateLimiting(RateLimitPolicies.OtpRequest)]
    public async Task<ActionResult<SendOtpResponse>> RequestOtp(
        [FromBody] SendOtpRequest request,
        CancellationToken ct = default)
    {
        try
        {
            if (!Guid.TryParse(User.FindFirstValue(JwtClaims.UserId), out var userId))
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unable to identify the user from the token"
                });

            var destination = request.Channel switch
            {
                OtpChannel.Sms => User.FindFirstValue(JwtClaims.Cellphone),
                OtpChannel.Email => User.FindFirstValue(JwtClaims.Email),
                _ => null
            };

            if (string.IsNullOrWhiteSpace(destination))
                return BadRequest(new ProblemDetails
                {
                    Title = $"No destination in the token for the '{request.Channel}' channel"
                });

            var response = await otpService.SendAsync(request.Channel, destination, userId, ct);
            return Ok(response);
        }
        catch (HttpRequestException ex)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Message provider request failed",
                detail: ex.Message);
        }
        catch (Exception ex)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "An unexpected error occurred",
                detail: ex.Message);
        }
    }

    /// <summary>
    ///     Verify the OTP received on the selected channel. A valid code is consumed
    ///     (invalidated) on first use, so each code can only be verified once.
    /// </summary>
    [HttpPost("verify")]
    public async Task<ActionResult<VerifyOtpResponse>> VerifyOtp(
        [FromBody] VerifyOtpRequest request,
        CancellationToken ct = default)
    {
        try
        {
            if (!Guid.TryParse(User.FindFirstValue(JwtClaims.UserId), out var userId))
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unable to identify the user from the token"
                });

            var isValid = await otpService.VerifyAsync(request.Channel, request.Code, userId, ct);
            return Ok(new VerifyOtpResponse(request.Channel, isValid));
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
