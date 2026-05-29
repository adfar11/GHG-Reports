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
        modelBuilder.Entity<EmissionCategory>()
            .Property(c => c.CO2Factor)
            .HasPrecision(18, 4);

        modelBuilder.Entity<EmissionRecord>()
            .Property(r => r.Quantity)
            .HasPrecision(18, 2);

        // 1. Feste IDs für Kategorien
        var kohleStromId = new Guid("11111111-1111-1111-1111-111111111111");
        var oekoStromId  = new Guid("11111111-2222-3333-4444-555555555555");

        // 2. LOGISTIK / FUHRPARK-KATEGORIEN
        var dieselId = new Guid("22222222-1111-1111-1111-222222222222");
        var benzinId = new Guid("22222222-2222-2222-2222-222222222222");
        var hybridGolfId = new Guid("33333333-1111-1111-1111-333333333333");
        var teslaId      = new Guid("33333333-2222-2222-2222-333333333333");
        //var hybrdId = new Guid("22222222-3333-2222-2222-222222222222");

        modelBuilder.Entity<Vehicle>().HasData(
            new Vehicle { VehicleId = hybridGolfId, Name = "VW Golf GTE", LicensePlate = "WOB-P 123", Type = VehicleType.PlugInHybrid },
            new Vehicle { VehicleId = teslaId, Name = "Tesla Model 3", LicensePlate = "WOB-E 999", Type = VehicleType.BatteryElectric }
        );

        modelBuilder.Entity<EmissionCategory>().HasData(
            new EmissionCategory { Id = kohleStromId, Name = "Stromnetz (Standard)", Scope = EmissionScope.Scope2, CO2Factor = 0.42, Unit = "kWh" },
            new EmissionCategory { Id = oekoStromId, Name = "Stromnetz (Standard)", Scope = EmissionScope.Scope2, CO2Factor = 0.36, Unit = "kWh" },
            new EmissionCategory { Id = dieselId, Name = "Fuhrpark (Diesel)", Scope = EmissionScope.Scope1, CO2Factor = 2.64, Unit = "Liters" },
            new EmissionCategory { Id = benzinId, Name = "Fuhrpark (Benzin)", Scope = EmissionScope.Scope1, CO2Factor = 2.50, Unit = "Liters" }
            //new EmissionCategory { Id = hybridGolfId, Name = "Fuhrpark (Hybrid)", Scope = EmissionScope.Scope1, CO2Factor = 1.50, Unit = "Liters" }
        );

        // 2. Absolut statische Datensätze für die Monate (Beispielhaft für Q1, erweiterbar)
        modelBuilder.Entity<EmissionRecord>().HasData(
            // Januar
            new EmissionRecord { Id = Guid.Parse("a1111111-0000-0000-0000-000000000001"), EmissionCategoryId = kohleStromId, Quantity = 4200, ConsumptionDate = new DateTime(2026, 1, 15), Description = "Strom Jan" },
            new EmissionRecord { Id = Guid.Parse("a2222222-0000-0000-0000-000000000001"), EmissionCategoryId = dieselId, Quantity = 1100, ConsumptionDate = new DateTime(2026, 1, 15), Description = "Diesel Jan" },
            
            // Februar
            new EmissionRecord { Id = Guid.Parse("a1111111-0000-0000-0000-000000000002"), EmissionCategoryId = oekoStromId, Quantity = 3900, ConsumptionDate = new DateTime(2026, 2, 15), Description = "Strom Feb" },
            new EmissionRecord { Id = Guid.Parse("a2222222-0000-0000-0000-000000000002"), EmissionCategoryId = benzinId, Quantity = 950, ConsumptionDate = new DateTime(2026, 2, 15), Description = "Diesel Feb" },
            
            // März
            new EmissionRecord { Id = Guid.Parse("a1111111-0000-0000-0000-000000000003"), EmissionCategoryId = oekoStromId, Quantity = 4500, ConsumptionDate = new DateTime(2026, 3, 15), Description = "Strom Mär" },
            new EmissionRecord { Id = Guid.Parse("a2222222-0000-0000-0000-000000000003"), EmissionCategoryId = dieselId, Quantity = 1300, ConsumptionDate = new DateTime(2026, 3, 15), Description = "Diesel Mär" },

            // April
            new EmissionRecord { Id = Guid.Parse("a1111111-0000-0000-0000-000000000004"), EmissionCategoryId = kohleStromId, Quantity = 3100, ConsumptionDate = new DateTime(2026, 4, 15), Description = "Strom Apr" },
            new EmissionRecord { Id = Guid.Parse("a2222222-0000-0000-0000-000000000004"), EmissionCategoryId = benzinId, Quantity = 1200, ConsumptionDate = new DateTime(2026, 4, 15), Description = "Diesel Apr" }
            
            // Hinweis: Du kannst die Liste hier analog für die Monate 5 bis 12 fortführen
        );

        base.OnModelCreating(modelBuilder);
    }
}
