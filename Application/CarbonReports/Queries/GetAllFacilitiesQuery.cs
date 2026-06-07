using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries
{

    public record FacilityLookupDto(
        Guid FacilityId, string FacilityName, string Country, bool IsDeletable);
    public record GetAllFacilitiesQuery : IRequest<List<FacilityLookupDto>>;
    public class GetAllFacilitiesHandler(ICarbonDbContext context)
      : IRequestHandler<GetAllFacilitiesQuery, List<FacilityLookupDto>>
    {
        public async Task<List<FacilityLookupDto>> Handle(
            GetAllFacilitiesQuery request, CancellationToken cancellationToken)
        {
            return await context.Facilities
                .AsNoTracking()
                .Select(f => new FacilityLookupDto(f.FacilityId, f.FacilityName, f.Country,
                !context.EmissionRecords.Any(e => e.FacilityId == f.FacilityId)))
                .ToListAsync(cancellationToken);
        }
    }
}