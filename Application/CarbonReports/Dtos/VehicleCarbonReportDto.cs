using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class VehicleCarbonReportDto
    {
        public Guid VehicleId { get; set; }
        public string VehicleName { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public int Year { get; set; }
        public double TotalCO2e { get; set; }
        
        // Aufteilung nach Energiequellen (z.B. wie viel kam von Benzin, wie viel von Strom)
        public List<CategoryEmissionBreakdownDto> Breakdown { get; set; } = new();
    }
}