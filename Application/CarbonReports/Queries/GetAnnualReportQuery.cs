using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Application.CarbonReports.Dtos;

namespace CarbonReport.Application.CarbonReports.Queries;

// 1. Die Query
public record GetAnnualReport(int Year, int? Month = null) : IRequest<CarbonReportDto>;

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

        // 3. Transformiere die Daten und lade sie in den Arbeitsspeicher
        // WICHTIG: Kategorie-Name wird hier mitgenommen, um das Dictionary zu füttern
        var records = await query
            .Select(r => new 
            {
                r.ConsumptionDate.Month,
                KategorieName = r.Category.Name,
                CO2e = (double)(r.Quantity * r.Category.CO2Factor) // Zu double casten, da DTO double nutzt
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
