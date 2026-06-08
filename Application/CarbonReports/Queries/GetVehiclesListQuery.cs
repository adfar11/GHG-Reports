using MediatR;
using Application.Interfaces;
using Application.CarbonReports.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries;

public record GetVehiclesListQuery : IRequest<List<VehicleDto>>;

public class GetVehiclesListQueryHandler(ICarbonDbContext context) 
    : IRequestHandler<GetVehiclesListQuery, List<VehicleDto>>
{
    public async Task<List<VehicleDto>> Handle(GetVehiclesListQuery request, CancellationToken cancellationToken)
    {
        var usedVehicleIds = await context.EmissionRecords
                    .Select(e => e.VehicleId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                // 2. Die Fahrzeuge unverändert aus der DB laden
                var dbVehicles = await context.Vehicles
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                // 3. Erst im Arbeitsspeicher (In-Memory) das DTO bauen und die Liste abgleichen
                var resultList = dbVehicles.Select(v => new VehicleDto
                {
                    VehicleId = v.VehicleId,
                    VehicleName = v.VehicleName,
                    LicensePlate = v.LicensePlate,
                    Type = v.Type.ToString(),
                    
                    // Das funktioniert hier im C#-Code garantiert, da die Daten bereits geladen sind
                    IsUsed = usedVehicleIds.Contains(v.VehicleId) 
                }).ToList();

                return resultList;
    }
}
