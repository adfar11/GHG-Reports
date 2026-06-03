using MediatR;
using Application.Interfaces;
using Application.CarbonReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries;

public record GetVehiclesListQuery : IRequest<List<VehicleDto>>;

public class GetVehiclesListQueryHandler(ICarbonDbContext context) : IRequestHandler<GetVehiclesListQuery, List<VehicleDto>>
{
    public async Task<List<VehicleDto>> Handle(GetVehiclesListQuery request, CancellationToken cancellationToken)
    {
        return await context.Vehicles
            .AsNoTracking()
            .Select(v => new VehicleDto
            {
                VehicleId = v.VehicleId,
                VehicleName = v.VehicleName,
                LicensePlate = v.LicensePlate,
                Type = v.Type.ToString() // Macht aus dem Enum einen String (z.B. "BatteryElectric")
            })
            .ToListAsync(cancellationToken);
    }
}
