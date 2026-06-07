using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using MediatR;

namespace Application.CarbonReports.Commands
{
     public record DeleteFacilityCommand(Guid FacilityId) : IRequest<bool>;
    public class DeleteFacilityCommandHandler(ICarbonDbContext context)
        : IRequestHandler<DeleteFacilityCommand, bool>
    {
        public async Task<bool> Handle(DeleteFacilityCommand request, CancellationToken cancellationToken)
        {
            var facility = await context.Facilities.FindAsync(request.FacilityId);
            if (facility == null) return false;

            context.Facilities.Remove(facility);
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}