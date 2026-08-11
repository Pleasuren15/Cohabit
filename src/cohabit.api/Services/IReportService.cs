using cohabit.api.Contracts;

namespace cohabit.api.Services;

public interface IReportService
{
    Task<ReportResultDto> SubmitAsync(ReportListingRequest request, CancellationToken ct = default);
}
