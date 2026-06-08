using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
public record DeleteVehicleCommand(Guid Id) : IRequest<bool>;

public class DeleteVehicleCommandHandler(ICarbonDbContext context)
    : IRequestHandler<DeleteVehicleCommand, bool>
{
    public async Task<bool> Handle(DeleteVehicleCommand request, CancellationToken cancellationToken)
    {
        // 1. Fahrzeug in der Datenbank suchen
        var vehicle = await context.Vehicles
            .FirstOrDefaultAsync(v => v.VehicleId == request.Id, cancellationToken);
            
        if (vehicle == null) return false;

        // 2. Prüfen, ob das Fahrzeug in Datensätzen/Emissionsberichten verwendet wird
        // Ersetzen Sie "EmissionEntries" durch den echten Namen Ihrer Verknüpfungstabelle
        var hasEntries = await context.EmissionRecords
            .AnyAsync(e => e.VehicleId == request.Id, cancellationToken);

        if (hasEntries)
        {
            // Verhindert das Löschen, da Fremdschlüssel-Einträge existieren
            return false; 
        }

        // 3. Wenn ungenutzt, sicher löschen
        context.Vehicles.Remove(vehicle);
        await context.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}

}