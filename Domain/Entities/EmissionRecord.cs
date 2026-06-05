using Domain.Entities;

public class EmissionRecord
{
    public Guid Id { get; set; }
    public Guid EmissionCategoryId { get; set; }
    public EmissionCategory Category { get; set; } = null!;
    
    public double Quantity { get; set; } 
    public DateTime ConsumptionDate { get; set; } 
    public string Description { get; set; } = string.Empty;

    // NEU: Snapshot des Ergebnisses für Audit-Sicherheit
    public double CalculatedCO2e { get; set; }

    // NEU: Verknüpfung zum Standort
    public Guid FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;

    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    // Aktualisierte Domain-Logik
    public void ExecuteCalculation()
    {
        if (Category?.HistoricalFactors == null) return;

        // Finde den Faktor, der zum Jahr des Verbrauchs passt
        var year = ConsumptionDate.Year;
        var matchingFactor = Category.HistoricalFactors
            .FirstOrDefault(f => f.Year == year);

        if (matchingFactor == null)
        {
            // Fallback: Nutze den neuesten verfügbaren Faktor, falls das Jahr 2026 noch nicht existiert
            matchingFactor = Category.HistoricalFactors.OrderByDescending(f => f.Year).FirstOrDefault();
        }

        if (matchingFactor != null)
        {
            // Berechnung ausführen und im Record fixieren
            CalculatedCO2e = Quantity * matchingFactor.Factor;
        }
    }
}
