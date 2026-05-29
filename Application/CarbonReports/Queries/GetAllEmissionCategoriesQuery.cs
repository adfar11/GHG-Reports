
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using MediatR;


namespace Application.CarbonReports.Queries
{
    public record GetAllEmissionCategoriesQuery : IRequest<List<EmissionCategoryDto>>;
    public class GetAllEmissionCategoriesQueryHandler(ICarbonDbContext context)
                : IRequestHandler<GetAllEmissionCategoriesQuery, List<EmissionCategoryDto>>
    {
        public async Task<List<EmissionCategoryDto>> Handle(
            GetAllEmissionCategoriesQuery request, CancellationToken cancellationToken)
        {
            return await context.EmissionCategories
            .AsNoTracking().Select(c => new EmissionCategoryDto
            {
                
                Id = c.Id,
                Name = c.Name,
                Code = c.Scope.ToString(),
                Description = $"Unit: {c.Unit}, Faktor: {c.CO2Factor}"
                
            })
            .ToListAsync(cancellationToken);
        }
    }
}