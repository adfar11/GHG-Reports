using System;
using System.Threading;
using System.Threading.Tasks;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Dtos;
using Application.CarbonReports.Queries;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ergibt die Route: api/EmissionRecords
    public class EmissionRecordsController(IMediator mediator, ICarbonDbContext context) : ControllerBase
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

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            // Wir nutzen hier direkt den Context für maximale Geschwindigkeit, analog zu den Kategorien
            var record = await context.EmissionRecords.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            
            if (record == null)
            {
                return NotFound(new { Message = "Eintrag nicht gefunden." });
            }

            context.EmissionRecords.Remove(record);
            await context.SaveChangesAsync(cancellationToken);

            return NoContent(); // HTTP 204: Erfolgreich gelöscht, kein Inhalt zurückgegeben
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] CreateEmissionRecordDto dto, CancellationToken cancellationToken)
        {
            if (dto.Quantity <= 0)
            {
                return BadRequest(new { Message = "Quantity must be greater than 0." });
            }

            var record = await context.EmissionRecords.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (record == null)
            {
                return NotFound(new { Message = "Eintrag nicht gefunden." });
            }

            // 1. Kategorie laden, um den CO2-Wert neu zu berechnen
            var category = await context.EmissionCategories.FirstOrDefaultAsync(c => c.Id == dto.EmissionCategoryId, cancellationToken);
            if (category == null)
            {
                return NotFound(new { Message = "Kategorie nicht gefunden." });
            }

            // 2. Werte aktualisieren
            record.EmissionCategoryId = dto.EmissionCategoryId;
            record.FacilityId = dto.FacilityId;
            record.VehicleId = dto.VehicleId;
            record.Quantity = dto.Quantity;
            record.ConsumptionDate = dto.ConsumptionDate;
            record.Description = dto.Description ?? string.Empty;
            record.CalculatedCO2e = dto.Quantity * category.CO2Factor; // Neu berechnen!

            await context.SaveChangesAsync(cancellationToken);
            return Ok(record);
        }

    }
}
