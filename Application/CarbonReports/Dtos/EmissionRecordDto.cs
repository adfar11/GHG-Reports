using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.CarbonReports.Dtos
{
    public class EmissionRecordDto
    {
        public Guid Id { get; set; }
        public string FacilityName { get; set; } = string.Empty; 
        public string CategoryName { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateTime ConsumptionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public double CalculatedCO2e { get; set; }
    }
}