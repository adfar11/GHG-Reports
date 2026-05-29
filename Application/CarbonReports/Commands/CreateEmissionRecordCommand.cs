using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    public record CreateEmissionRecordCommand(
        Guid EmissionsCategoryId,
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
            bool categoryExists = await EntityFrameworkQueryableExtensions.AnyAsync<EmissionCategory>(
                context.EmissionCategories,
            ec => ec.Id == request.EmissionsCategoryId, cancellationToken);
            if (!categoryExists) 
            throw new Exception($"Category with id {request.EmissionsCategoryId} does not exist.");

            if(request.VehicleId.HasValue) {
                bool vehicleExists = await context.Vehicles
                .AsNoTracking()
                .AnyAsync(v => v.VehicleId == request.VehicleId, cancellationToken);
                if (!vehicleExists) 
                throw new Exception($"Vehicle with id {request.VehicleId} does not exist.");
            }

            var newRecord = new Domain.Entities.EmissionRecord
            {
                EmissionCategoryId = request.EmissionsCategoryId,
                Quantity = request.Quantity,
                ConsumptionDate = request.ConsumptionDate,
                Description = request.Description
            };

             // In den DbContext einfügen und speichern
            await context.EmissionRecords.AddAsync(newRecord, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            

            // Die ID des neu erstellten Datensatzes zurückgeben
            return newRecord.Id;
        }
    }
}