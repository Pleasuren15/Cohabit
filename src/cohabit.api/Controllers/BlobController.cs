using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("files")]
public class BlobController(IBlobService blobService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        try
        {
            var names = await blobService.ListAsync(ct);
            return Ok(names);
        }
        catch (Exception ex)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "An unexpected error occurred",
                detail: ex.Message);
        }
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> Get(string name, CancellationToken ct)
    {
        try
        {
            var result = await blobService.GetAsync(name, ct);
            if (result is null)
                return NotFound();

            return File(result.Content, result.ContentType, name);
        }
        catch (Exception ex)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "An unexpected error occurred",
                detail: ex.Message);
        }
    }

    [HttpPost]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided or file is empty." });

        try
        {
            await using var stream = file.OpenReadStream();
            await blobService.UploadAsync(file.FileName, stream, ct);

            return CreatedAtAction(nameof(Get), new { name = file.FileName }, null);
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
