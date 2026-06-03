using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries
{
    public record GetVehicleByIdQuery(Guid Id) : IRequest<VehicleDto?>;

    public class GetVehicleByIdQueryHandler(ICarbonDbContext context)
    : IRequestHandler<GetVehicleByIdQuery, VehicleDto?>
    {
        public async Task<VehicleDto?> Handle(
            GetVehicleByIdQuery request, CancellationToken cancellationToken)
        {
            var vehicle = await context.Vehicles
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.VehicleId == request.Id, cancellationToken);

        if (vehicle == null) return null;

        // ✅ Nutzen Sie geschweifte Klammern und weisen Sie die Properties direkt zu
        return new VehicleDto
        {
            VehicleId = vehicle.VehicleId,
            VehicleName = vehicle.VehicleName,
            LicensePlate = vehicle.LicensePlate,
            Type = vehicle.Type.ToString(),
        };
            
            
        }
    }

}