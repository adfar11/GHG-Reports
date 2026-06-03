using System.Threading;
using System.Threading.Tasks;
using Application.CarbonReports.Queries; // Namespace Ihrer Query prüfen
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Route: api/EmissionCategories
    public class EmissionCategoriesController(IMediator mediator) : ControllerBase
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
    }
}
