namespace Application.CarbonReports.Dtos;

public class VehicleDto
{
    public Guid VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
