using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
    {
        public void Configure(EntityTypeBuilder<Vehicle> builder)
        {
            builder.HasKey(v => v.VehicleId);
            builder.Property(v => v.LicensePlate).IsRequired().HasMaxLength(20);
            
            // ✅ KORRIGIERT: Die Zeile mit "v.Model" wurde gelöscht

            // Relation: Ein Fahrzeug hat viele historische Einträge
            builder.HasMany(v => v.EmissionRecords)
                .WithOne(e => e.Vehicle)
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
