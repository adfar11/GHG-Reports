using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class FacilityConfiguration : IEntityTypeConfiguration<Facility>
    {
        public void Configure(EntityTypeBuilder<Facility> builder)
        {
            builder.HasKey(f => f.FacilityId);
            builder.Property(f => f.FacilityName).IsRequired().HasMaxLength(150);
            builder.Property(f => f.Country).IsRequired().HasMaxLength(100);

                  // Relation: Ein Standort hat viele historische Einträge
            builder.HasMany(f => f.EmissionRecords)
                .WithOne(e => e.Facility)
                .HasForeignKey(e => e.FacilityId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}