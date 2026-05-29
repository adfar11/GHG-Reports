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
            return await context.Vehicles
                          .AsNoTracking()
                          .Where(v => v.VehicleId == request.Id)
                          .Select(v => new VehicleDto(
                              v.VehicleId,
                              v.Name,
                              v.LicensePlate,
                              v.Type
                          )).FirstOrDefaultAsync(cancellationToken);
            
            
        }
    }

}