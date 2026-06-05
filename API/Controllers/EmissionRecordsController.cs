using System;
using System.Threading;
using System.Threading.Tasks;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Dtos;
using Application.CarbonReports.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ergibt die Route: api/EmissionRecords
    public class EmissionRecordsController(IMediator mediator) : ControllerBase
    {
 [HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> Create([FromBody] CreateEmissionRecordDto dto, CancellationToken cancellationToken)
{
    if (dto.Quantity <= 0)
    {
        return BadRequest(new { Message = "Quantity must be greater than 0." });
    }

    try
    {
        // KORRIGIERT: Reihenfolge exakt an den Record-Konstruktor angepasst!
        var command = new CreateEmissionRecordCommand(
            dto.EmissionCategoryId,    // 1. Parameter: EmissionCategoryId (Kategorie)
            dto.FacilityId,            // 2. Parameter: FacilityId (Standort)
            dto.Quantity,              // 3. Parameter: Quantity
            dto.ConsumptionDate,       // 4. Parameter: ConsumptionDate
            dto.Description,           // 5. Parameter: Description
            dto.VehicleId              // 6. Parameter: VehicleId
        );

        var newRecordId = await mediator.Send(command, cancellationToken);

        // KORRIGIERT: Explizite Angabe der ID für die REST-konforme Location-Response
        return CreatedAtAction("GetById", new { id = newRecordId }, new { Id = newRecordId });
    }
    catch (KeyNotFoundException ex)
    {
        // Verhindert den Fehler 500, falls eine ID im System fehlt
        return NotFound(new { Message = ex.Message });
    }
}


        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var query = new GetEmissionRecordByIdQuery(id);
                var result = await mediator.Send(query, cancellationToken);
                
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }


        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var query = new GetEmissionRecordsQuery();
            var result = await mediator.Send(query, cancellationToken);
            return Ok(result);
        }
    }
}
