using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public record GetAnnualReport(int Year, int? Month, string? FacilityName, string? CompanyName) : IRequest<CarbonReportDto>;

public class GetAnnualReportHandler(ICarbonDbContext context) 
    : IRequestHandler<GetAnnualReport, CarbonReportDto>
{
    public async Task<CarbonReportDto> Handle(GetAnnualReport request, CancellationToken cancellationToken)
    {
        // 1. Erstelle die Basis-Abfrage auf der Datenbank (Filter auf das Jahr)
        var query = context.EmissionRecords
            .AsNoTracking()
            .Where(r => r.ConsumptionDate.Year == request.Year);

        // 2. Filter den optionalen Monat DIREKT auf der Datenbank
        if (request.Month.HasValue)
        {
            query = query.Where(r => r.ConsumptionDate.Month == request.Month.Value);
        }

        // Filter nach dem ausgewählten Standort-Namen
        if (!string.IsNullOrWhiteSpace(request.FacilityName))
        {
            query = query.Where(e => e.Facility.FacilityName == request.FacilityName);
        }

        // 3. Transformiere die Daten und lade sie in den Arbeitsspeicher
        // 🌟 KORREKTUR: Wir entfernen die fehlerhafte Relation 'r.Facility.Company'
        var records = await query
            .Select(r => new 
            {
                r.ConsumptionDate.Month,
                KategorieName = r.Category.Name,
                CO2e = r.CalculatedCO2e
            })
            .ToListAsync(cancellationToken);

        // 🌟 NEU: Da 'Company' auf der Facility fehlt, holen wir uns hier einen Fallback-Namen,
        // oder Sie können ihn direkt fest für Ihr System/Mandanten hinterlegen (z.B. aus der Benutzer-Session)
        string firmenName = "Ihre Firma GmbH"; 

        // 4. Baue das CarbonReportDto im Arbeitsspeicher zusammen
        var report = new CarbonReportDto
        {
            Year = request.Year,
            TotalCO2e = records.Sum(x => x.CO2e),
            
            // 🌟 BEFÜLLUNG FÜR DAS PDF:
            //CompanyName = firmenName,
            CompanyName = !string.IsNullOrWhiteSpace(request.CompanyName) 
            ? request.CompanyName : "Standard Firma GmbH",
            FacilityName = !string.IsNullOrWhiteSpace(request.FacilityName) ? request.FacilityName : "All Facilities",

            MonthlyEmissions = records
                .GroupBy(x => x.Month)
                .Select(monthGroup => new MonthlyEmissionDto
                {
                    MonthNumber = monthGroup.Key,
                    MonthName = CultureInfo.GetCultureInfo("de-DE").DateTimeFormat.GetMonthName(monthGroup.Key),
                    MonthlyTotalCO2e = monthGroup.Sum(x => x.CO2e),
                    
                    Categories = monthGroup
                        .GroupBy(x => x.KategorieName)
                        .ToDictionary(
                            katGroup => katGroup.Key, 
                            katGroup => katGroup.Sum(x => x.CO2e)
                        )
                })
                .OrderBy(m => m.MonthNumber)
                .ToList()
        };

        return report;
    }
}
