using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CreateEmissionRecordDto
    {
        public Guid EmissionCategoryId { get; set; }
        public Guid? VehicleId { get; set; }
        public double Quantity { get; set; }
        public DateTime ConsumptionDate { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}