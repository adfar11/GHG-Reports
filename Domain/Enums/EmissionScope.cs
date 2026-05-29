namespace Domain.Enums
{
    public enum EmissionScope
    {
        Scope1 = 1, // Direkte Emissionen (z. B. eigener Fuhrpark, Heizung)
        Scope2 = 2, // Indirekte Emissionen aus eingekaufter Energie (z. B. Strom, Fernwärme)
        Scope3 = 3  // Sonstige indirekte Emissionen (z. B. Dienstreisen, Lieferkette)
    }
}