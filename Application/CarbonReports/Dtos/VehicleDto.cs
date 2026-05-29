using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.CarbonReports.Dtos
{
    public record VehicleDto(
        Guid Id, string Name, string LicensePlate, VehicleType Type);
}