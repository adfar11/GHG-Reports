using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    public record DeleteVehicleCommand(Guid Id): IRequest<bool>;
    public class DeleteVehicleCommandHandler(ICarbonDbContext context)
      : IRequestHandler<DeleteVehicleCommand, bool>
    {
        public async Task<bool> Handle(DeleteVehicleCommand request, CancellationToken cancellationToken)
        {
            var vehicle = await context.Vehicles.FirstOrDefaultAsync(v => v.VehicleId == request.Id);
            if (vehicle == null) return false;
            context.Vehicles.Remove(vehicle);
            await context.SaveChangesAsync();
            return true;
        }
    }
}