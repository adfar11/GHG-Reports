using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class EmissionFactor
    {
        public Guid Id { get; set; }
        public double Factor { get; set; } // z.B. 0.380
        public int Year { get; set; } // z.B. 2025, 2026
        public string Source { get; set; } = string.Empty; // z.B. "Umweltbundesamt"

        public Guid EmissionCategoryId { get; set; }
        public EmissionCategory Category { get; set; } = null!;
    }
}