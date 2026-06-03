using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class EmissionRecordConfiguration : IEntityTypeConfiguration<EmissionRecord>
    {
        public void Configure(EntityTypeBuilder<EmissionRecord> builder)
    {
        // 1. Primärschlüssel
        builder.HasKey(e => e.Id);

        // 2. Eigenschaften konfigurieren
        builder.Property(e => e.Quantity)
            .IsRequired();

        builder.Property(e => e.ConsumptionDate)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(500); // Begrenzung für die Beschreibung

        // 3. Wichtig: Zugriff auf das private set von CalculatedCO2e erlauben
        builder.Property(e => e.CalculatedCO2e)
            .IsRequired();

        // 4. Relationen (Fremdschlüssel) definieren

        // Relation zu EmissionCategory
        builder.HasOne(e => e.Category)
            .WithMany(c => c.EmissionRecords) // Falls Category keine Collection für Records hat, bleibt WithMany leer
            .HasForeignKey(e => e.EmissionCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relation zu Facility
        builder.HasOne(e => e.Facility)
            .WithMany(f => f.EmissionRecords)
            .HasForeignKey(e => e.FacilityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relation zu Vehicle (Optional, da ein Eintrag nicht zwingend ein Auto braucht)
        builder.HasOne(e => e.Vehicle)
            .WithMany(v => v.EmissionRecords)
            .HasForeignKey(e => e.VehicleId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false); // Macht die Relation im SQL-Schema nullable
      }
   }
}