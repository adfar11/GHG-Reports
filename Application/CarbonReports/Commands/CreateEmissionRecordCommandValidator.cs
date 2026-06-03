using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;

namespace Application.CarbonReports.Commands
{
    public class CreateEmissionRecordCommandValidator : AbstractValidator<CreateEmissionRecordCommand>
    {
        public CreateEmissionRecordCommandValidator()
        {
            //Quantity must be greater than 0
            RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");

            //EmissionCategoryId cannot empty
           // RuleFor(x => x.EmissionsCategoryId)
            //.NoEmpty()
            RuleFor(x => x.EmissionCategoryId)
                .NotEmpty() 
                .WithMessage("EmissionCategoryId must have a valid EmissionCategoryId.");

            // ConsumptionDate cannot be in the future
            RuleFor(x => x.ConsumptionDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("ConsumptionDate must not be in the future. Please enter a valid ConsumptionDate.");
        }
    }
}