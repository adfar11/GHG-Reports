using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

public record GetAllEmissionCategoriesQuery : IRequest<List<EmissionCategoryDto>>;

public class GetAllEmissionCategoriesQueryHandler(ICarbonDbContext context)
            : IRequestHandler<GetAllEmissionCategoriesQuery, List<EmissionCategoryDto>>
{
    public async Task<List<EmissionCategoryDto>> Handle(
        GetAllEmissionCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await context.EmissionCategories
        .AsNoTracking()
        .Select(c => new EmissionCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Code = c.Scope.ToString(), // z.B. "Scope1"
            Description = $"Unit: {c.Unit}, Faktor: {c.CO2Factor}",
            
            // Prüft direkt über die Navigation Property, ob Datensätze existieren
            IsUsed = c.EmissionRecords.Any() 
        })
        .ToListAsync(cancellationToken);
    }
}
