using System.Threading;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.CarbonReports.Queries; // Namespace Ihrer Query prüfen
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Route: api/EmissionCategories
    public class EmissionCategoriesController(IMediator mediator, ICarbonDbContext context) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            // Ersetzt "GetEmissionCategoriesQuery" durch den exakten Namen Ihrer Query im Application-Layer
            var query = new GetAllEmissionCategoriesQuery(); 
            var result = await mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
            //[ProducesResponseType(StatusCodes.Status21Created)]
            [ProducesResponseType(StatusCodes.Status400BadRequest)]
            public async Task<IActionResult> Create([FromBody] CreateEmissionCategoryDto dto)
            {
                if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Unit))
                {
                    return BadRequest("Name and Unit are required.");
                }

                var newCategory = new EmissionCategory
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    Unit = dto.Unit,
                    Scope = (EmissionScope)dto.Scope, // Castet den Integer (1,2,3) auf Ihr Enum
                    CO2Factor = dto.CO2Factor
                };

                context.EmissionCategories.Add(newCategory);
                await context.SaveChangesAsync();

                // return CreatedAtAction(nameof(GetAll), new { id = newCategory.Id }, newCategory);
                return Ok(newCategory);
            }


    }
}
