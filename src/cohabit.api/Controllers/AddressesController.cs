using cohabit.api.Contracts;
using cohabit.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cohabit.api.Controllers;

[ApiController]
[Route("api/addresses")]
public class AddressesController(IAddressService addressService) : ControllerBase
{
    /// <summary>
    ///     Search addresses by suburb, street or postal code, optionally filtered by province.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AddressDto>>> Search(
        [FromQuery] string? q,
        [FromQuery] int? provinceId,
        CancellationToken ct = default)
    {
        var addresses = await addressService.SearchAsync(new AddressQuery(q, provinceId), ct);
        return Ok(addresses);
    }

    /// <summary>
    ///     Get a single address with its province.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AddressDto>> GetById(Guid id, CancellationToken ct = default)
    {
        var address = await addressService.GetByIdAsync(id, ct);
        return Ok(address);
    }

    /// <summary>
    ///     Create a new address.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create(
        [FromBody] CreateAddressRequest request,
        CancellationToken ct = default)
    {
        var address = await addressService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = address.Id }, address);
    }

    /// <summary>
    ///     Update an address.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AddressDto>> Update(
        Guid id,
        [FromBody] UpdateAddressRequest request,
        CancellationToken ct = default)
    {
        var address = await addressService.UpdateAsync(id, request, ct);
        return Ok(address);
    }

    /// <summary>
    ///     Delete an address. Addresses referenced by a user or listing cannot be deleted.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        await addressService.DeleteAsync(id, ct);
        return NoContent();
    }
}
