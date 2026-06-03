using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using MediatR;

namespace Application.CarbonReports.Commands
{
    public record CreateFacilityCommand(string FacilityName, string Country) : IRequest<Guid>;
    public class CreateFacilityCommandHandler(ICarbonDbContext context) : IRequestHandler<CreateFacilityCommand, Guid>
    {
        public async Task<Guid> Handle(CreateFacilityCommand request, CancellationToken cancellationToken)
        {
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