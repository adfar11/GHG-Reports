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
    public record GetAllVehiclesQuery : IRequest<List<VehicleDto>>;
    public class GetAllVehiclesQueryHandler(ICarbonDbContext context)
       : IRequestHandler<GetAllVehiclesQuery, List<VehicleDto>>
    {
        public async Task<List<VehicleDto>> Handle(GetAllVehiclesQuery request, CancellationToken cancellationToken)
        {
            return await context.Vehicles
            .AsNoTracking()
            .Select(v => new VehicleDto(v.VehicleId, v.Name, v.LicensePlate, v.Type))
            .ToListAsync(cancellationToken);
        }
    }
}