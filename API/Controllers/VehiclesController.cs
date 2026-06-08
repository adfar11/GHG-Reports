using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Queries;
using Application.CarbonReports.Dtos;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")] // Route: api/Vehicles
public class VehiclesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<VehicleDto>))]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetVehiclesListQuery();
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }



    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateVehicleCommand command, CancellationToken cancellationToken)
    {
        var newVehicleId = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = newVehicleId }, new { Id = newVehicleId });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteVehicle(Guid id, CancellationToken cancellationToken)
    {
        // Den MediatR-Command mit der ID aus der URL erstellen
        var command = new DeleteVehicleCommand(id);
        
        // Command an den Handler senden
        var success = await mediator.Send(command, cancellationToken);

        // Wenn das Fahrzeug nicht existierte -> 404 Not Found
        if (!success)
        {
            return NotFound(new { message = $"Vehicle with id {id} not found." });
        }

        // Bei erfolgreichem Löschen -> 204 No Content (Standard für DELETE)
        return NoContent();
    }
}
