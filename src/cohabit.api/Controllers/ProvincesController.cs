using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("api/provinces")]
public class ProvincesController(IProvinceService provinceService) : ControllerBase
{
    /// <summary>
    ///     List all provinces for the landing page and listing filters.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProvinceDto>>> GetAll(CancellationToken ct = default)
    {
        var provinces = await provinceService.GetAllAsync(ct);
        return Ok(provinces);
    }
}
