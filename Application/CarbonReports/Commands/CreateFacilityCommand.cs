using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces; // Stellt ICarbonDbContext bereit
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Commands
{
    // 1. Das Create-Command samt Handler
    public record CreateFacilityCommand(string FacilityName, string Country) : IRequest<Guid>;

    public class CreateFacilityCommandHandler(ICarbonDbContext context) 
        : IRequestHandler<CreateFacilityCommand, Guid>
    {
        public async Task<Guid> Handle(CreateFacilityCommand request, CancellationToken cancellationToken)
        {
            bool nameExists = await context.Facilities
                .AnyAsync(f => f.FacilityName.ToLower() == request.FacilityName.ToLower(), cancellationToken);

            if (nameExists)
            {
                throw new Exception(
                    $"Facility with name '{request.FacilityName}' already exists."
                );
            }
            var newFacility = new Domain.Entities.Facility
            {
                FacilityId = Guid.NewGuid(),
                FacilityName = request.FacilityName,
                Country = request.Country
            };
            
            context.Facilities.Add(newFacility);
            await context.SaveChangesAsync(cancellationToken);
            return newFacility.FacilityId;
        }
    }
}
