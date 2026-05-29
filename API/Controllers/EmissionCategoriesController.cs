using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    }
}