using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CarbonReport.Persistence.Context;

public class CarbonDbContext(DbContextOptions<CarbonDbContext> options) : DbContext(options), ICarbonDbContext
{
    public DbSet<EmissionRecord> EmissionRecords => Set<EmissionRecord>();
    public DbSet<EmissionCategory> EmissionCategories => Set<EmissionCategory>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Hinweis: HasPrecision funktioniert nur bei decimal. Wenn deine Properties double sind,
        // ignoriert EF Core dies bei SQLite/Postgres oder wirft bei SQL Server evtl. Warnungen.
        modelBuilder.Entity<EmissionCategory>()
            .Property(c => c.CO2Factor)
            .HasPrecision(18, 4);

        modelBuilder.Entity<EmissionRecord>()
            .Property(r => r.Quantity)
            .HasPrecision(18, 2);

        // 1. Feste IDs für Kategorien (Strom)
        var kohleStromId = new Guid("11111111-1111-1111-1111-111111111111");
        var oekoStromId  = new Guid("11111111-2222-3333-4444-555555555555");

        // 2. Feste IDs für Fuhrpark-Kategorien
        var dieselId = new Guid("22222222-1111-1111-1111-222222222222");
        var benzinId = new Guid("22222222-2222-2222-2222-222222222222");
        
        // 3. Feste ID für Heizung (Erdgas)
        var erdgasId = new Guid("44444444-1111-1111-1111-444444444444");

        // Fahrzeug-IDs (für den Fuhrpark)
        var hybridGolfId = new Guid("33333333-1111-1111-1111-333333333333");
        var teslaId      = new Guid("33333333-2222-2222-2222-333333333333");

        // Seed: Fahrzeuge
        modelBuilder.Entity<Vehicle>().HasData(
            new Vehicle { VehicleId = hybridGolfId, Name = "VW Golf GTE", LicensePlate = "WOB-P 123", Type = VehicleType.PlugInHybrid },
            new Vehicle { VehicleId = teslaId, Name = "Tesla Model 3", LicensePlate = "WOB-E 999", Type = VehicleType.BatteryElectric }
        );

        // Seed: Emissionskategorien (Zahlen als double ohne 'm' Suffix)
        modelBuilder.Entity<EmissionCategory>().HasData(
            new EmissionCategory { Id = kohleStromId, Name = "Stromnetz (Standard)", Scope = EmissionScope.Scope2, CO2Factor = 0.42, Unit = "kWh" },
            new EmissionCategory { Id = oekoStromId, Name = "Stromnetz (Ökostrom)", Scope = EmissionScope.Scope2, CO2Factor = 0.36, Unit = "kWh" },
            new EmissionCategory { Id = dieselId, Name = "Fuhrpark (Diesel)", Scope = EmissionScope.Scope1, CO2Factor = 2.64, Unit = "Liters" },
            new EmissionCategory { Id = benzinId, Name = "Fuhrpark (Benzin)", Scope = EmissionScope.Scope1, CO2Factor = 2.50, Unit = "Liters" },
            new EmissionCategory { Id = erdgasId, Name = "Heizung (Erdgas)", Scope = EmissionScope.Scope1, CO2Factor = 0.20, Unit = "kWh" }
        );

        // Seed: Monatliche Datensätze (Zahlen als double ohne 'm' Suffix)
        modelBuilder.Entity<EmissionRecord>().HasData(
            // Januar
            new EmissionRecord { Id = new Guid("a1111111-0000-0000-0000-000000000001"), EmissionCategoryId = kohleStromId, Quantity = 4200, ConsumptionDate = new DateTime(2026, 1, 15), Description = "Strom Jan" },
            new EmissionRecord { Id = new Guid("a2222222-0000-0000-0000-000000000001"), EmissionCategoryId = dieselId, Quantity = 1100, ConsumptionDate = new DateTime(2026, 1, 15), Description = "Diesel Jan" },
            new EmissionRecord { Id = new Guid("a4444444-0000-0000-0000-000000000001"), EmissionCategoryId = erdgasId, Quantity = 8500, ConsumptionDate = new DateTime(2026, 1, 15), Description = "Erdgas Jan" },
            
            // Februar
            new EmissionRecord { Id = new Guid("a1111111-0000-0000-0000-000000000002"), EmissionCategoryId = oekoStromId, Quantity = 3900, ConsumptionDate = new DateTime(2026, 2, 15), Description = "Strom Feb" },
            new EmissionRecord { Id = new Guid("a2222222-0000-0000-0000-000000000002"), EmissionCategoryId = dieselId, Quantity = 950, ConsumptionDate = new DateTime(2026, 2, 15), Description = "Diesel Feb" },
            new EmissionRecord { Id = new Guid("a4444444-0000-0000-0000-000000000002"), EmissionCategoryId = erdgasId, Quantity = 7800, ConsumptionDate = new DateTime(2026, 2, 15), Description = "Erdgas Feb" },
            
            // März
            new EmissionRecord { Id = new Guid("a1111111-0000-0000-0000-000000000003"), EmissionCategoryId = oekoStromId, Quantity = 4500, ConsumptionDate = new DateTime(2026, 3, 15), Description = "Strom Mär" },
            new EmissionRecord { Id = new Guid("a2222222-0000-0000-0000-000000000003"), EmissionCategoryId = dieselId, Quantity = 1300, ConsumptionDate = new DateTime(2026, 3, 15), Description = "Diesel Mär" },
            new EmissionRecord { Id = new Guid("a4444444-0000-0000-0000-000000000003"), EmissionCategoryId = erdgasId, Quantity = 6200, ConsumptionDate = new DateTime(2026, 3, 15), Description = "Erdgas Mär" },

            // April
            new EmissionRecord { Id = new Guid("a1111111-0000-0000-0000-000000000004"), EmissionCategoryId = kohleStromId, Quantity = 3100, ConsumptionDate = new DateTime(2026, 4, 15), Description = "Strom Apr" },
            new EmissionRecord { Id = new Guid("a2222222-0000-0000-0000-000000000004"), EmissionCategoryId = dieselId, Quantity = 1200, ConsumptionDate = new DateTime(2026, 4, 15), Description = "Diesel Apr" },
            new EmissionRecord { Id = new Guid("a4444444-0000-0000-0000-000000000004"), EmissionCategoryId = erdgasId, Quantity = 3100, ConsumptionDate = new DateTime(2026, 4, 15), Description = "Erdgas Apr" }
        );

        base.OnModelCreating(modelBuilder);
    }
}
