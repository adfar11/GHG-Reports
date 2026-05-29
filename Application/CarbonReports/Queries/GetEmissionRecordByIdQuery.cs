using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CarbonReports.Queries
{
    public record GetEmissionRecordByIdQuery(Guid Id) : IRequest<EmissionRecordDetailsDto>;
    public class GetEmissionRecordByIdHandler(ICarbonDbContext context)
      : IRequestHandler<GetEmissionRecordByIdQuery, EmissionRecordDetailsDto>
    {
        public async Task<EmissionRecordDetailsDto> Handle(
            GetEmissionRecordByIdQuery request, CancellationToken cancellationToken)
        {
            var record = context.EmissionRecords
                         .Include(r => r.Category)
                         .FirstOrDefault(r => r.Id == request.Id);
           if (record == null) throw new Exception($"Record with id {request.Id} not found.");

            return new EmissionRecordDetailsDto
            {
                Id = record.Id,
                Quantity = record.Quantity,
                ConsumptionDate = record.ConsumptionDate,
                Description = record.Description,
                CalculatedCO2e = record.CalculateCO2e(),
                CategoryName = record.Category.Name,
                CategoryScope = record.Category.Scope
            };
        }
    }
}