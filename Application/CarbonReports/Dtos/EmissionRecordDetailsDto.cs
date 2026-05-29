using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Application.CarbonReports.Dtos
{
    public class EmissionRecordDetailsDto
    {
        public Guid Id { get; set; }
        public double Quantity { get; set; }
        public DateTime ConsumptionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public double CalculatedCO2e { get; set; }

        // Infos aus der verknüpften Kategorie
        public string CategoryName { get; set; } = string.Empty;
        public EmissionScope CategoryScope { get; set; }
    }
}