using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries
{
public record GetEmissionRecordsQuery : IRequest<List<EmissionRecordDto>>;

    public class GetEmissionRecordsHandler(ICarbonDbContext context)
        : IRequestHandler<GetEmissionRecordsQuery, List<EmissionRecordDto>>
    {
        public async Task<List<EmissionRecordDto>> Handle(GetEmissionRecordsQuery request, CancellationToken cancellationToken)
        {
            return await context.EmissionRecords
                .AsNoTracking()
                .Select(e => new EmissionRecordDto
                {
                    // 2. KORREKTUR: Objekt-Initialisierung über geschwungene Klammern statt Konstruktor
                    Id = e.Id,
                    FacilityName = e.Facility.FacilityName, // Holt den string-Namen aus der Relation
                    CategoryName = e.Category.Name,         // Holt den string-Namen aus der Relation
                    Quantity = e.Quantity,
                    Unit = e.Category.Unit,
                    ConsumptionDate = e.ConsumptionDate,
                    Description = e.Description,
                    CalculatedCO2e = e.CalculatedCO2e
                })
                .ToListAsync(cancellationToken);
        }
    }
}