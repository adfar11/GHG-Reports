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
        public async Task<IActionResult> Create([FromBody] CreateEmissionRecordDto dto, CancellationToken cancellationToken)
        {
            if (dto.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            // Wichtig: Reihenfolge der Parameter an deinen Command-Konstruktor anpassen!
            var command = new CreateEmissionRecordCommand(
                dto.FacilityId,            // 1. Parameter: FacilityId
                dto.EmissionCategoryId,    // 2. Parameter: EmissionsCategoryId
                dto.Quantity,              // 3. Parameter: Quantity
                dto.ConsumptionDate,       // 4. Parameter: ConsumptionDate
                dto.Description,           // 5. Parameter: Description
                dto.VehicleId   
            );

            var newRecordId = await mediator.Send(command, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = newRecordId }, new { Id = newRecordId });
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
