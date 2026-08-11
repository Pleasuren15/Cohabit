using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

/// <summary>
///     Lets a viewer flag a listing. The API emails a styled HTML summary of
///     the report to the safety team so they can review it. The endpoint is
///     anonymous so guests can report a listing too; the caller's token is
///     attached when available for attribution.
/// </summary>
[ApiController]
[Route("api/reports")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    /// <summary>
    ///     Submits a property report and notifies the safety team by email.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReportResultDto>> Submit(
        ReportListingRequest request,
        CancellationToken ct = default)
    {
        var result = await reportService.SubmitAsync(request, ct);
        return Ok(result);
    }
}
