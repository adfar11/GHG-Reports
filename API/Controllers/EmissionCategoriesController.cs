using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Dtos;
using Application.CarbonReports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmissionCategoriesController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllEmissionCategories(CancellationToken cancellationToken)
        {
            var query = new GetAllEmissionCategoriesQuery();
            var result = await mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateEmissionRecordDto dto)
        {
            // Validierung (Optional: Kann auch über FluentValidation gelöst werden)
            if (dto.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            // DTO auf das CQRS Command mappen
            var command = new CreateEmissionRecordCommand(
                dto.EmissionCategoryId,
                dto.Quantity,
                dto.ConsumptionDate,
                dto.Description,
                dto.VehicleId
            );

            // Command via MediatR an den Handler senden
            var newRecordId = await mediator.Send(command);

            // Best Practice: 201 Created Status mit dem Pfad zur Ressource zurückgeben
            return CreatedAtAction(nameof(Create), new { id = newRecordId }, new { Id = newRecordId });
        }


        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            try
            {
                var query = new GetEmissionRecordByIdQuery(id);
                var result = await mediator.Send(query);
                
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }
    }
}