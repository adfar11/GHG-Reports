using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;

namespace Application.Interfaces
{
    public interface IPdfReportService
    {
        byte[] GeneratePdfReport(CarbonReportDto report, int?    filteredMonth);
    }
}