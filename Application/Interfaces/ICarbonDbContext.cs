using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces
{
    public interface ICarbonDbContext
    {
        DbSet<EmissionCategory> EmissionCategories { get; }
        DbSet<EmissionRecord> EmissionRecords { get; }
        DbSet<Vehicle> Vehicles { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        DbSet<Facility> Facilities { get; }
    }
}