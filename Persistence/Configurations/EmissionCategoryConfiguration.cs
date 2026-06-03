using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class EmissionCategoryConfiguration : IEntityTypeConfiguration<EmissionCategory>
    {
         public void Configure(EntityTypeBuilder<EmissionCategory> builder)
    {
        // Primärschlüssel (Guid)
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.Unit)
            .IsRequired()
            .HasMaxLength(20);

        // Enum-Konvertierung (Speichert den Enum-Wert als Zahl in der DB)
        builder.Property(c => c.Scope)
            .HasConversion<int>()
            .IsRequired();

        // Relation: Eine Kategorie hat viele historische Faktoren
        builder.HasMany(c => c.HistoricalFactors)
            .WithOne(f => f.Category)
            .HasForeignKey(f => f.EmissionCategoryId)
            .OnDelete(DeleteBehavior.Cascade); // Löscht Faktoren, wenn Kategorie gelöscht wird

    }
 }

}