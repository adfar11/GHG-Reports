
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries
{
    public record GetEmissionRecordByIdQuery(Guid Id) : IRequest<EmissionRecordDetailsDto>;

    public class GetEmissionRecordByIdHandler(ICarbonDbContext context)
        : IRequestHandler<GetEmissionRecordByIdQuery, EmissionRecordDetailsDto>
    {
        public async Task<EmissionRecordDetailsDto> Handle(GetEmissionRecordByIdQuery request, CancellationToken cancellationToken)
        {
            var record = await context.EmissionRecords
                .Include(r => r.Category) // Wichtig: Heißt in deiner Entity 'Category'
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken) ?? throw new KeyNotFoundException($"Emission record with ID {request.Id} was not found.");

            // Mapping auf das DTO unter Verwendung deiner Domain-Logik
            return new EmissionRecordDetailsDto
            {
                Id = record.Id,
                Quantity = record.Quantity,
                ConsumptionDate = record.ConsumptionDate,
                Description = record.Description,
                
                // Hier rufen wir direkt deine Methode aus der Entity auf!
                CalculatedCO2e = record.CalculateCO2e(), 
                
                // Sicheres Auslesen der Kategorie-Eigenschaften
                CategoryName = record.Category?.Name ?? "Unbekannte Kategorie",
                CategoryScope = record.Category?.Scope ?? Domain.Enums.EmissionScope.Scope1
            };
        }
    }
}
