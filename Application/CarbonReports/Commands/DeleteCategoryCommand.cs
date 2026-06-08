using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using MediatR;

namespace Application.CarbonReports.Commands
{
    public record DeleteCategoryCommand(Guid Id) : IRequest<bool>;

    public class DeleteCategoryCommandHandler(ICarbonDbContext context)
        : IRequestHandler<DeleteCategoryCommand, bool>
    {
        public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await context.EmissionCategories
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
                
            if (category == null) return false;

            // Prüfen, ob Fremdschlüssel-Einträge existieren
            var hasEntries = await context.EmissionRecords
                .AnyAsync(e => e.Id == request.Id, cancellationToken);

            if (hasEntries) return false; // Löschen blockiert

            context.EmissionCategories.Remove(category);
            await context.SaveChangesAsync(cancellationToken);
            
            return true;
        }
    }

}