using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Context
{
    public class CarbonDbContext : DbContext, ICarbonDbContext
    {
        public CarbonDbContext(DbContextOptions<CarbonDbContext> options)
            : base(options)
        {
        }

        // DbSets für den Zugriff auf die Tabellen
        public DbSet<Facility> Facilities { get; set; } = null!;
        public DbSet<Vehicle> Vehicles { get; set; } 
        public DbSet<EmissionCategory> EmissionCategories { get; set; } = null!;
        public DbSet<EmissionFactor> EmissionFactors { get; set; } = null!;
        public DbSet<EmissionRecord> EmissionRecords { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
         base.OnModelCreating(modelBuilder);

    // 1. Automatische Registrierung der Konfigurationen
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarbonDbContext).Assembly);

    // 2. Eindeutige und saubere Guids definieren
    var testFacilityId = new Guid("85a21e42-7db2-4a1e-84b2-e1c9d2f34e01");
    var testCategoryId = new Guid("4fa85f64-5717-4562-b3fc-2c963f66afa6");
    var testFactorId   = new Guid("11111111-2222-3333-4444-555555555555");

    // STANDORT (Facility)
    modelBuilder.Entity<Facility>().HasData(new Facility
    {
        FacilityId = testFacilityId,
        FacilityName = "Werk München",
        Country = "Deutschland"
    });

    // KATEGORIE (EmissionCategory)
    modelBuilder.Entity<EmissionCategory>().HasData(new EmissionCategory
    {
        Id = testCategoryId, // MUSS exakt mit testCategoryId übereinstimmen
        Name = "Stromnetz Deutschland",
        Unit = "kWh",
        Scope = EmissionScope.Scope2, 
        CO2Factor = 0.380 
    });

    // HISTORISCHER FAKTOR (EmissionFactor)
    modelBuilder.Entity<EmissionFactor>().HasData(new EmissionFactor
    {
        Id = testFactorId,
        EmissionCategoryId = testCategoryId, // Verweist sauber auf die obige Kategorie
        Year = 2026,
        Factor = 0.385,
        Source = "Umweltbundesamt"
    });
        }

        // Explizite Implementierung der SaveChangesAsync Methode aus dem Interface
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
