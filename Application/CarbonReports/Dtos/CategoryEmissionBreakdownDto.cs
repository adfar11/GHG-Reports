using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CategoryEmissionBreakdownDto
    {
        public string CategoryName { get; set; } = string.Empty; // z.B. "Fuhrpark (Benzin)"
        public double TotalQuantity { get; set; }               // z.B. 450 Liter
        public string Unit { get; set; } = string.Empty;         // z.B. "Liters"
        public double CO2e { get; set; }                         // Berechneter CO2-Wert für diese Kategorie
    }
}