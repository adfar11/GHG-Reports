using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class MonthlyEmissionDto
    {
        public int MonthNumber { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public double MonthlyTotalCO2e { get; set; }
        // Aufteilung nach Kategorien für gestapelte Balkendiagramme (z.B. "Strom" -> 450.5 kg)
        public Dictionary<string, double> Categories { get; set; } = new();
    }
}