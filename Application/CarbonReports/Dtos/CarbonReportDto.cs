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

        // NEU: Informationen für das PDF-Reporting
        public string CompanyName { get; set; } = string.Empty;
        public string FacilityName { get; set; } = string.Empty;
    }
}