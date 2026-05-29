using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    public record UpdateVehicleCommand(
        Guid Id, string Name, string LicensePlate, VehicleType Type) : IRequest<bool>;
    public class UpdateVehicleCommandHandler(ICarbonDbContext context)
      : IRequestHandler<UpdateVehicleCommand, bool>
    {
        public async Task<bool> Handle(UpdateVehicleCommand request, CancellationToken cancellationToken)
        {
            var vehicle = await context.Vehicles
                          .FirstOrDefaultAsync(v => v.VehicleId == request.Id, cancellationToken);
            
            if (vehicle == null) return false;

            vehicle.Name = request.Name;
            vehicle.LicensePlate = request.LicensePlate;
            vehicle.Type = request.Type;
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}