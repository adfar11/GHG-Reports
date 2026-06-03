namespace Domain.Entities;

public enum VehicleType
{
    InternalCombustion, // 0
    BatteryElectric,    // 1
    PlugInHybrid        // 2
}

public class Vehicle
{
    public Guid VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public ICollection<EmissionRecord> EmissionRecords { get; set; } = new List<EmissionRecord>();
}
