using System;
using Microsoft.EntityFrameworkCore;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;

namespace Application.CarbonReports.Queries
{
    public record GetAllReportsQuery : IRequest<List<CarbonReportDto>>;
    public class GetAllReportsQueryHandler(ICarbonDbContext context) : IRequestHandler<GetAllReportsQuery, List<CarbonReportDto>>
    {


        public async Task<List<CarbonReportDto>> Handle(GetAllReportsQuery request, CancellationToken cancellationToken)
        {
            // 1. Alle relevanten Daten asynchron und ohne Tracking laden
            var records = await context.EmissionRecords
                .AsNoTracking()
                .Select(r => new 
                {
                    r.ConsumptionDate.Year,
                    r.ConsumptionDate.Month,
                    // Berechnung direkt in der DB: Menge * CO2-Faktor der Kategorie
                    CO2e = r.Quantity * r.Category.CO2Factor 
                })
                .ToListAsync(cancellationToken);

            // 2. Daten im Arbeitsspeicher nach Jahr gruppieren
            var reports = records
                .GroupBy(r => r.Year)
                .Select(yearGroup => new CarbonReportDto
                {
                    Year = yearGroup.Key,
                    // Summe aller Emissionen in diesem Jahr
                    TotalCO2e = yearGroup.Sum(x => x.CO2e),
                    
                    // Monatliche Aufteilung für dieses Jahr berechnen
                    MonthlyEmissions = yearGroup
                        .GroupBy(m => m.Month)
                        .Select(monthGroup => new MonthlyEmissionDto
                        {
                            MonthNumber = monthGroup.Key,
                            MonthlyTotalCO2e = monthGroup.Sum(x => x.CO2e)
                        })
                        .OrderBy(m => m.MonthNumber) // Sortiert von Januar (1) bis Dezember (12)
                        .ToList()
                })
                .OrderByDescending(r => r.Year) // Neueste Jahre (z.B. 2026, 2025) zuerst anzeigen
                .ToList();

            return reports;
        }
    }
}