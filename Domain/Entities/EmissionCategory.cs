using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class EmissionCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; // z.B. "Stromnetz Deutschland"
        public EmissionScope Scope { get; set; }
        
        // Faktor, um Verbrauch in CO2e umzurechnen (z.B. kg CO2e pro kWh)
        public double CO2Factor { get; set; } 
        public string Unit { get; set; } = string.Empty; // z.B. "kWh", "Liters", "km"
        
        // Navigation Property für EF Core
        public ICollection<EmissionRecord> EmissionRecords { get; set; } = new List<EmissionRecord>();
        public ICollection<EmissionFactor> HistoricalFactors { get; set; } = new List<EmissionFactor>();
        
    }
}