
using System.Runtime.InteropServices;
using Application.CarbonReports.Commands;
using Application.CarbonReports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FacilitiesController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
         [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var query = new GetAllFacilitiesQuery();
            var result = await mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        // Ergänze deinen FacilitiesController im API-Projekt um diesen POST-Endpunkt:
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateFacilityCommand command, CancellationToken cancellationToken)
        {
            var newFacilityId = await mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { id = newFacilityId }, new { Id = newFacilityId });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFacility(Guid id)
        {

            try
            {
                
            var command = new DeleteFacilityCommand(id);
            var result = await mediator.Send(command);

            if (!result)
            {
                return NotFound(new { message = $"Facility with id {id} not found." });
            }

            return NoContent(); // 204 No Content ist Standard für erfolgreiche Löschungen
            } catch(BadHttpRequestException ex) {
                return BadRequest(new { message = ex.Message });
            }

        }

    }
}