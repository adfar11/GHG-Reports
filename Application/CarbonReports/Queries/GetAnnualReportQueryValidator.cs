
using FluentValidation;

namespace Application.CarbonReports.Queries
{
    public class GetAnnualReportQueryValidator : AbstractValidator<GetAnnualReport>
    {
        public GetAnnualReportQueryValidator()
        {
            RuleFor(x => x.Year)
                   .InclusiveBetween(2000, 2100)
                   .WithMessage("Year must be between 2000 and 2100.");
            

            RuleFor(x => x.Month)
                  .InclusiveBetween(1, 12)
                  .When(x => x.Month.HasValue)
                  .WithMessage("Month must be between 1 and 12.");
        }
    }
}