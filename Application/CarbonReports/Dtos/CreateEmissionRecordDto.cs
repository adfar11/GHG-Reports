using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CreateEmissionRecordDto
    {
    // Diese Namen MÜSSEN exakt mit dem JSON übereinstimmen
        public Guid EmissionCategoryId { get; set; } // Nutzt du hier ggf. "EmissionsCategoryId" mit 's'?
        public Guid FacilityId { get; set; }
        public double Quantity { get; set; }
        public DateTime ConsumptionDate { get; set; }
        public string? Description { get; set; }
        public Guid? VehicleId { get; set; }
    }
}

