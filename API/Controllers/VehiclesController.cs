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
    public class VehiclesController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateVehicle (
             [FromBody] CreateVehicleCommand command, CancellationToken cancellationToken)
        {
            var result = await mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(CreateVehicle), new { id = result }, new { id = result });
        }

        [HttpPut("{id:guid}")] // PUT api/vehicles/e3b0c442-98fc-1c14-9afb-f4c8996fb9242
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateVehicle(
             Guid id, [FromBody] UpdateVehicleCommand request, CancellationToken cancellationToken)
        {
            var command = new UpdateVehicleCommand(id, request.Name, request.LicensePlate, request.Type);
            var success = await mediator.Send(command, cancellationToken);
            if (!success) return NotFound($"Vehicle with id {id} not found.");
            return NoContent();
        }

        [HttpDelete("{id:guid}")] // DELETE api/vehicles/e3b0c442-98fc-1c14-9afb-f4c8996fb9242
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteVehicle(Guid id, CancellationToken cancellationToken)
        {
            var command = new DeleteVehicleCommand(id);
            var success = await mediator.Send(command, cancellationToken);
            if (!success) return NotFound($"Vehicle with id {id} not found."); 
            return NoContent();
        }


        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<VehicleCarbonReportDto>))]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var query = new GetAllVehiclesQuery();
            var result = await mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")] // GET api/vehicles/e3b0c442-98fc-1c14-9afb-f4c8996fb9242
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VehicleDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetVehicleById(Guid id, CancellationToken cancellationToken)
        {
            var query = new GetVehicleByIdQuery(id);
            var result = await mediator.Send(query, cancellationToken);
            if (result == null) return NotFound($"Vehicle with id {id} not found."); 
            return Ok(result);
        }
    }
}