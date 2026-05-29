using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using CarbonReport.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;


namespace Persistence
{
    public static class DependencyInjection 
    {
        public static IServiceCollection AddPersistence(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<CarbonDbContext>(options => options.UseSqlite(connectionString));

                    // Mappt das Interface der Application-Schicht auf die konkrete DB-Implementierung
            services.AddScoped<ICarbonDbContext>(provider => provider.GetRequiredService<CarbonDbContext>());
            return services;
        }
    }
}