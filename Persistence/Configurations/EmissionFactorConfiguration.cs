using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class EmissionFactorConfiguration : IEntityTypeConfiguration<EmissionFactor>
    {
        public void Configure(EntityTypeBuilder<EmissionFactor> builder)
    {
        // Primärschlüssel (Guid)
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Factor)
            .IsRequired();

        builder.Property(f => f.Year)
            .IsRequired();

        builder.Property(f => f.Source)
            .HasMaxLength(200);

        // Die Relation wurde bereits in EmissionCategoryConfiguration definiert,
        // kann hier aber zur Sicherheit für den Fremdschlüssel hinterlegt werden:
        builder.HasOne(f => f.Category)
            .WithMany(c => c.HistoricalFactors)
            .HasForeignKey(f => f.EmissionCategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
  }

}