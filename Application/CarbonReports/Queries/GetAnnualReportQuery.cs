using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// 1. Die Query (Unverändert, perfekt als Record gelöst)
public record GetAnnualReport(int Year, int? Month, string? FacilityName) : IRequest<CarbonReportDto>;

// 2. Der Handler
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

        // HIER MIT TEIL 2 WEITERMACHEN (Transformation)
        // 3. Transformiere die Daten und lade sie in den Arbeitsspeicher
        // 🌟 KORREKTUR: Nutzt jetzt direkt das audit-sichere Feld 'CalculatedCO2e' aus der DB!
        var records = await query
            .Select(r => new 
            {
                r.ConsumptionDate.Month,
                KategorieName = r.Category.Name,
                CO2e = r.CalculatedCO2e // Kein fehleranfälliges Nachrechnen im Select nötig
            })
            .ToListAsync(cancellationToken);

        // 4. Baue das CarbonReportDto im Arbeitsspeicher zusammen
        var report = new CarbonReportDto
        {
            Year = request.Year,
            TotalCO2e = records.Sum(x => x.CO2e),
            MonthlyEmissions = records
                .GroupBy(x => x.Month)
                .Select(monthGroup => new MonthlyEmissionDto
                {
                    MonthNumber = monthGroup.Key,
                    // Fügt den echten deutschen Monatsnamen hinzu (z.B. "Januar")
                    MonthName = CultureInfo.GetCultureInfo("de-DE").DateTimeFormat.GetMonthName(monthGroup.Key),
                    MonthlyTotalCO2e = monthGroup.Sum(x => x.CO2e),
                    
                    // Befüllt dein Dictionary für die Balkendiagramme & die PDF-Spalten
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
