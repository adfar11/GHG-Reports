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
    public record GetVehicleCarbonReportQuery(Guid VehicleId, int Year, int? Month = null) 
        : IRequest<VehicleCarbonReportDto>;
    public class GetVehicleCarbonReportQueryHandler(ICarbonDbContext context)
        : IRequestHandler<GetVehicleCarbonReportQuery, VehicleCarbonReportDto>
    {
        public async Task<VehicleCarbonReportDto> Handle(GetVehicleCarbonReportQuery request, CancellationToken cancellationToken)
        {
            //check if vehicle exists and base Data
            var vehicle = await context.Vehicles.AsTracking()
                          .FirstOrDefaultAsync(r => r.VehicleId == request.VehicleId , cancellationToken);
            
            if(vehicle == null) throw new Exception($"Vehicle with id {request.VehicleId} not found.");

            var query = context.EmissionRecords.AsTracking()
                    .Where(r => r.VehicleId == request.VehicleId && r.ConsumptionDate.Year == request.Year);
            
            if (request.Month.HasValue)
            {
                query = query.Where(r => r.ConsumptionDate.Month == request.Month.Value);
            }

            //All Data for this vehicle and year
            var records = await query
                        .Select(r => new 
                          {
                            r.Quantity,
                            CategoryName = r.Category.Name,
                            Unit = r.Category.Unit,
                            CO2e = r.Quantity * r.Category.CO2Factor 
                          })
                          .ToListAsync(cancellationToken);
                          
            
            var report = new VehicleCarbonReportDto
            {
                VehicleId = vehicle.VehicleId,
                VehicleName = vehicle.VehicleName,
                Year = request.Year,
                LicensePlate = vehicle.LicensePlate,
                TotalCO2e = records.Sum(x => x.CO2e),
                Breakdown = records
                    .GroupBy(x => new {x.CategoryName, x.Unit})
                    .Select(g => new CategoryEmissionBreakdownDto
                    {
                        CategoryName = g.Key.CategoryName,
                        Unit = g.Key.Unit,
                        TotalQuantity = g.Sum(x => x.Quantity),
                        CO2e = g.Sum(x => x.CO2e),
                        
                    }).ToList()
            };
            

            return report;
        }
    }
}