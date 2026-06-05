
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    // Das Command nimmt alle Daten aus dem React-Frontend entgegen
    public record CreateEmissionRecordCommand(
        Guid EmissionCategoryId,
        Guid FacilityId,
        double Quantity,
        DateTime ConsumptionDate,
        string? Description,
        Guid? VehicleId
    ) : IRequest<Guid>;

    public class CreateEmissionRecordCommandHandler(ICarbonDbContext context) 
        : IRequestHandler<CreateEmissionRecordCommand, Guid>
    {
        public async Task<Guid> Handle(CreateEmissionRecordCommand request, CancellationToken cancellationToken)
        {
            // 1. Die zugehörige Kategorie aus der DB laden, um an den CO2-Faktor zu kommen
            var category = await context.EmissionCategories
                .FirstOrDefaultAsync(c => c.Id == request.EmissionCategoryId, cancellationToken);

            if (category == null)
            {
                throw new KeyNotFoundException($"Emissionskategorie mit der ID {request.EmissionCategoryId} wurde nicht gefunden.");
            }

            // 2. Mathematische CO2-Berechnung durchführen: Menge * CO2-Faktor der Kategorie
            // Beispiel: 50 Liter Diesel * 2.64 (Faktor) = 132 kg CO2e
            double calculatedCO2e = request.Quantity * category.CO2Factor;

            // 3. Das neue Domain-Objekt mit dem berechneten Wert befüllen
            var newRecord = new EmissionRecord
            {
                Id = Guid.NewGuid(),
                EmissionCategoryId = request.EmissionCategoryId,
                FacilityId = request.FacilityId,
                VehicleId = request.VehicleId, // Kann null sein (z.B. bei Gebäude-Heizung)
                Quantity = request.Quantity,
                ConsumptionDate = request.ConsumptionDate,
                Description = request.Description ?? string.Empty,
                
                // Hier weisen wir den frisch berechneten Wert der DB-Spalte zu
                CalculatedCO2e = calculatedCO2e 
            };

            // 4. In der Datenbank speichern
            context.EmissionRecords.Add(newRecord);
            await context.SaveChangesAsync(cancellationToken);

            return newRecord.Id;
        }
    }
}
