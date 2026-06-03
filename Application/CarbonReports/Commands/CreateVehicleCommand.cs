using MediatR;
using Application.Interfaces;
using Domain.Entities;

namespace Application.CarbonReports.Commands;

public record CreateVehicleCommand(string VehicleName, string LicensePlate, string Type) : IRequest<Guid>;

public class CreateVehicleCommandHandler(ICarbonDbContext context) : IRequestHandler<CreateVehicleCommand, Guid>
{
    public async Task<Guid> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        // Sicheres Fallback-Parsing im Handler
        if (!Enum.TryParse<VehicleType>(request.Type, true, out var parsedType))
        {
            parsedType = VehicleType.InternalCombustion;
        }

        var newVehicle = new Vehicle
        {
            VehicleId = Guid.NewGuid(),
            VehicleName = request.VehicleName,
            LicensePlate = request.LicensePlate,
            Type = parsedType
        };

        context.Vehicles.Add(newVehicle);
        await context.SaveChangesAsync(cancellationToken);
        return newVehicle.VehicleId;
    }
}
