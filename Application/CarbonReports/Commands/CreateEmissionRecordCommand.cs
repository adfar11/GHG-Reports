using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    public record CreateEmissionRecordCommand(
        Guid FacilityId,
        Guid EmissionCategoryId,
        double Quantity,
        DateTime ConsumptionDate,
        string Description,
        Guid? VehicleId
    ) : IRequest<Guid>;

    public class CreateEmissionRecordHandler(ICarbonDbContext context)
        : IRequestHandler<CreateEmissionRecordCommand, Guid>
    {
        public async Task<Guid> Handle(CreateEmissionRecordCommand request, CancellationToken cancellationToken)
        {
            // 1. Validierung: Existiert die Facility? (KORRIGIERT: request.FacilityId statt request.EmissionCategoryId)
            bool facilityExists = await context.Facilities
                .AsNoTracking()
                .AnyAsync(f => f.FacilityId == request.FacilityId, cancellationToken);
                
            if (!facilityExists) 
                throw new NotFoundException("Facility", request.FacilityId);

            // 2. Validierung: Existiert die Kategorie? (KORRIGIERT: Sauberes AnyAsync ohne Erweiterungsklasse)
            // WICHTIG: Wir laden hier die Kategorie inklusive der historischen Faktoren für die CO2-Berechnung!
            var category = await context.EmissionCategories
                .Include(c => c.HistoricalFactors)
                .FirstOrDefaultAsync(ec => ec.Id == request.EmissionCategoryId, cancellationToken);
                
            if (category == null) 
                throw new NotFoundException("EmissionCategory", request.EmissionCategoryId);

            // 3. Validierung: Existiert das Fahrzeug (falls angegeben)?
            if (request.VehicleId.HasValue) 
            {
                bool vehicleExists = await context.Vehicles
                    .AsNoTracking()
                    .AnyAsync(v => v.VehicleId == request.VehicleId, cancellationToken);
                    
                if (!vehicleExists) 
                    throw new NotFoundException("Vehicle", request.VehicleId);
            }

            // 4. Neuen Datensatz erstellen
            var newRecord = new EmissionRecord
            {
                Id = Guid.NewGuid(),
                EmissionCategoryId = request.EmissionCategoryId,
                Category = category, // Weisen wir zu, damit die Berechnungslogik Zugriff auf die Faktoren hat
                FacilityId = request.FacilityId,
                Quantity = request.Quantity,
                ConsumptionDate = request.ConsumptionDate,
                Description = request.Description,
                VehicleId = request.VehicleId
            };

            // 5. NEU: Domänenlogik für die automatische CO2-Berechnung triggern
            newRecord.ExecuteCalculation();

            // 6. In den DbContext einfügen und speichern
            await context.EmissionRecords.AddAsync(newRecord, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            // Die ID des neu erstellten Datensatzes zurückgeben
            return newRecord.Id;
        }
    }
}
