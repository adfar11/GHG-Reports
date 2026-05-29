using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CarbonReportDto
    {
        public int Year { get; set; }
        public double TotalCO2e { get; set; }
        public List<MonthlyEmissionDto> MonthlyEmissions { get; set; } = new();
            
        // Optionale globale Metadaten
         public double TotalAnnualCO2e { get; set; }
    }
}