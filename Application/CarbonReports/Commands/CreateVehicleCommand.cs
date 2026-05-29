using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.CarbonReports.Commands
{
    public record CreateVehicleCommand(
        string Name, string LicensePlate, VehicleType Type) : IRequest<Guid>;
    public class CreateVehicleCommandHandler(ICarbonDbContext context) 
    : IRequestHandler<CreateVehicleCommand, Guid>
    {

        public async Task<Guid> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
        {
            var newVehicle = new Vehicle
            {
                VehicleId = Guid.NewGuid(),
                Name = request.Name,
                LicensePlate = request.LicensePlate,
                Type = request.Type
            };

           context.Vehicles.Add(newVehicle);
           await context.SaveChangesAsync(cancellationToken);
           
            return newVehicle.VehicleId;
        }
    }
}