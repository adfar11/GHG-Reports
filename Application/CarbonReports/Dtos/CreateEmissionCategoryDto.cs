using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.CarbonReports.Dtos
{
    public class CreateEmissionCategoryDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("unit")]
        public string Unit { get; set; } = null!;

        [JsonPropertyName("scope")]
        public int Scope { get; set; }

        // 👈 Das fängt sowohl "co2Factor" als auch "co2factor" sauber ab!
        [JsonPropertyName("co2Factor")] 
        public double CO2Factor { get; set; }
    }
}