using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CarbonDashboardDto
    {
        public double TotalScope1CO2e { get; set; }
        public double TotalScope2CO2e { get; set; }
        public double TotalCO2e => TotalScope1CO2e + TotalScope2CO2e; 
    }
}