using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Facility
    {
        public Guid FacilityId { get; set; }
        public string FacilityName { get; set; } = string.Empty; // z.B. "Werk München"
        public string? Location { get; set; }
        public string Country { get; set; } = string.Empty; // Wichtig für Strommix-Validierung
        
        public ICollection<EmissionRecord> EmissionRecords { get; set; } = new List<EmissionRecord>();
    }
}