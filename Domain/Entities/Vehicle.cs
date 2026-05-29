

namespace Domain.Entities
{
    public enum VehicleType
    {
        InternalCombustion, // Reiner Verbrenner (Benzin/Diesel)
        BatteryElectric,    // Reines E-Auto
        PlugInHybrid        // Hybrid (nutzt Strom und Kraftstoff)
    }
    public class Vehicle
    {
        public Guid VehicleId { get; set; }
        public string Name { get; set; } = string.Empty; // z.B. "Firmenwagen Chef"
        public string LicensePlate { get; set; } = string.Empty; // z.B. "B-MW-2026"
        public VehicleType Type { get; set; }

        // Navigation Property: Ein Fahrzeug kann viele Verbrauchseinträge haben
        public ICollection<EmissionRecord> Records { get; set; } = new List<EmissionRecord>();
    }
}