using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class EmissionRecord
    {
        public Guid Id { get; set; }
        public Guid EmissionCategoryId { get; set; }
        public EmissionCategory Category { get; set; } = null!;
        
        public double Quantity { get; set; } // Der tatsächliche Verbrauchswert (z.B. 2500 kWh)
        public DateTime ConsumptionDate { get; set; } // Wichtig für die 12-Monats-Zuordnung
        
        public string Description { get; set; } = string.Empty; // Optionale Notiz (z.B. "Stromrechnung Q1")

        // Domain-Logik direkt in der Entity (Rich Domain Model)
        public double CalculateCO2e()
        {
            if (Category == null) return 0;
            return Quantity * Category.CO2Factor;
        }

        public Guid? VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}