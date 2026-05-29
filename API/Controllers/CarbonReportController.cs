using Application.CarbonReports.Commands;
using Application.CarbonReports.Dtos;
using Application.CarbonReports.Queries;
using Application.Interfaces;
using Application.Services;
using CarbonReport.Application.CarbonReports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")] 
public class CarbonReportController(IMediator mediator, IPdfReportService pdfService) : ControllerBase
{
    // GET: api/carbonreport/2026
    [HttpGet("{year:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CarbonReportDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnnualReport(int year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        if(year < 2000 || year > 2100 ) return BadRequest("Year must be between 2000 and 2100.");
        if(month.HasValue && (month < 1 || month > 12)) return BadRequest("Month must be between 1 and 12.");
        var query = new GetAnnualReport( year, month);
        var result = await mediator.Send(query, cancellationToken);
        
        return Ok(result);
    }

    // POST: api/carbonreport
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEmissionRecord([FromBody] CreateEmissionRecordDto request, 
                                                          CancellationToken cancellationToken)
    {
        if(request.Quantity < 0) return BadRequest("Quantity must be greater than 0.");
        var command = new CreateEmissionRecordCommand(
            request.EmissionCategoryId,   request.Quantity, request.ConsumptionDate, request.Description, request.VehicleId);
        var result = await mediator.Send(command, cancellationToken);
        
        // Nutzt das korrekte Jahr aus dem Request für den Redirect-Link
        return CreatedAtAction(nameof(GetAnnualReport), new { year = request.ConsumptionDate.Year },
                                new { id = result } );
    }

    // GET: api/carbonreport/e3b0c442-98fc-1c14-9afb-f4c8996fb9242
    [HttpGet("{id:guid}")] 
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmissionRecordById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetEmissionRecordByIdQuery(id);
        var result = await mediator.Send(query, cancellationToken);

        if (result == null) return NotFound($"Record with id {id} not found.");
        
        return Ok(result);
    }


    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<CarbonReportDto>))]
    public async Task<IActionResult> GetAllReports(CancellationToken cancellationToken)
    {
        var query = new GetAllReportsQuery();
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("vehicle/{vehicleId:guid}/{year:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VehicleCarbonReportDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVehicleCarbonReport(
        Guid vehicleId, int year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        if(year < 2000 || year > 2100 ) return BadRequest("Year must be between 2000 and 2100.");
        if(month.HasValue && (month < 1 || month > 12)) return BadRequest("Month must be between 1 and 12.");
        var query = new GetVehicleCarbonReportQuery(vehicleId, year, month);
        var result = await mediator.Send(query, cancellationToken);

        if (result == null) return NotFound($"Vehicle with id {vehicleId} not found.");
        return Ok(result);
    }
    [HttpGet("{year:int}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileStreamResult))] // Typisiert als Datei
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAnnualReportPdf(int year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        // Gleiche Validierung wie oben
        if (year < 2000 || year > 2100) return BadRequest("Year must be between 2000 and 2100.");
        if (month.HasValue && (month < 1 || month > 12)) return BadRequest("Month must be between 1 and 12.");
        
        // 1. Dieselbe MediatR-Query nutzen, um die Daten zu holen
        var query = new GetAnnualReport(year, month);
        var result = await mediator.Send(query, cancellationToken);
        
        // 2. PDF über den injizierten Service generieren
        byte[] pdfBytes = pdfService.GeneratePdfReport(result, month);
        
        // 3. Dateinamen definieren
        string dateiname = month.HasValue 
            ? $"Emission Report_{year}_{month.Value:D2}.pdf" 
            : $"Yearly Emission Report_{year}.pdf";
            
        // 4. Als PDF-Datei zurückgeben
        return File(pdfBytes, "application/pdf", dateiname);
    }

}