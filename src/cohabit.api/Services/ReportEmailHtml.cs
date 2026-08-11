using System.Globalization;
using System.Net;
using cohabit.api.Contracts;

namespace cohabit.api.Services;

/// <summary>Builds the styled HTML notification email sent when a listing is reported.</summary>
public static class ReportEmailHtml
{
    public static string Build(
        ReportListingRequest request,
        ListingDetailDto listing,
        Guid reportId,
        DateTime submittedAt)
    {
        var reason = Esc(ReportReasons.LabelFor(request.Reason));
        var details = string.IsNullOrWhiteSpace(request.Details)
            ? null
            : Esc(request.Details);

        var address = string.Join(", ", new[]
        {
            listing.Address.AddressLine1,
            listing.Address.AddressLine2,
            listing.Address.Suburb,
            listing.Address.Province.Name,
            listing.Address.PostalCode,
        }.Where(s => !string.IsNullOrWhiteSpace(s)));

        var ownerName = $"{listing.Owner.FirstName} {listing.Owner.LastName}".Trim();
        var price = string.Create(CultureInfo.InvariantCulture, $"R{listing.Price:N0}");
        var deposit = string.Create(CultureInfo.InvariantCulture, $"R{listing.Deposit:N0}");
        var availableFrom = listing.AvailableFrom.ToString("d MMM yyyy", CultureInfo.InvariantCulture);
        var submitted = submittedAt.ToString("d MMM yyyy HH:mm 'UTC'", CultureInfo.InvariantCulture);

        var detailsBlock = details is not null
            ? $"<div style=\"font-size:14px;color:#333333;line-height:1.6;white-space:pre-wrap;\">{details}</div>"
            : "<div style=\"font-size:14px;color:#9a9a94;font-style:italic;\">No additional details were provided.</div>";

        return $$"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Cohabit — Property report</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f4f1ea;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2b2b2b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;">
                <tr>
                  <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7dfd2;">
                      <tr>
                        <td style="background-color:#7a3a12;padding:28px 32px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:middle;">
                                <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">Cohabit</span>
                                <div style="font-size:12px;color:#f5dccb;margin-top:2px;">Property reports</div>
                              </td>
                              <td align="right" style="vertical-align:middle;">
                                <span style="display:inline-block;background:#ffffff;color:#7a3a12;font-size:11px;font-weight:700;padding:6px 12px;border-radius:999px;">OPEN</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px 32px 0;">
                          <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9a9a94;font-weight:600;">New property report</p>
                          <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#1f1f1f;line-height:1.3;">"{{Esc(listing.Title)}}" was reported</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px 32px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background-color:#fdf1ea;border:1px solid #f0c9b4;border-radius:12px;padding:16px 20px;">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#a85a2e;font-weight:700;margin-bottom:6px;">Why it was reported</div>
                                <div style="font-size:16px;font-weight:600;color:#7a3a12;">{{reason}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px 32px 0;">
                          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a9a94;font-weight:600;margin-bottom:8px;">Reported by</div>
                          <div style="font-size:15px;color:#333333;">{{Esc(request.ReporterName)}}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px 32px 0;">
                          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a9a94;font-weight:600;margin-bottom:8px;">Additional details</div>
                          {{detailsBlock}}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:28px 32px 0;">
                          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a9a94;font-weight:600;margin-bottom:12px;">The listing</div>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7dfd2;border-radius:12px;overflow:hidden;">
                            <tr style="background-color:#faf8f4;">
                              <td style="padding:12px 16px;width:33%;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Price</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{price}}</div>
                              </td>
                              <td style="padding:12px 16px;width:34%;border-left:1px solid #e7dfd2;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Deposit</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{deposit}}</div>
                              </td>
                              <td style="padding:12px 16px;width:33%;border-left:1px solid #e7dfd2;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Type</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{Esc(listing.Type)}}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:12px 16px;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Beds</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{listing.Beds}}</div>
                              </td>
                              <td style="padding:12px 16px;border-left:1px solid #e7dfd2;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Baths</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{listing.Baths}}</div>
                              </td>
                              <td style="padding:12px 16px;border-left:1px solid #e7dfd2;">
                                <div style="font-size:11px;color:#9a9a94;margin-bottom:4px;">Available from</div>
                                <div style="font-size:15px;font-weight:600;color:#1f1f1f;">{{availableFrom}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:20px 32px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="vertical-align:top;padding-right:16px;">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a9a94;font-weight:600;margin-bottom:8px;">Location</div>
                                <div style="font-size:14px;color:#333333;line-height:1.5;">{{address}}</div>
                              </td>
                              <td width="50%" style="vertical-align:top;">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a9a94;font-weight:600;margin-bottom:8px;">Owner</div>
                                <div style="font-size:14px;color:#333333;line-height:1.5;">{{ownerName}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:28px 32px 32px;">
                          <hr style="border:none;border-top:1px solid #e7dfd2;margin:0 0 16px;" />
                          <div style="font-size:11px;color:#9a9a94;line-height:1.7;">
                            Report ID: {{reportId}}<br />
                            Listing ID: {{listing.Id}}<br />
                            Submitted: {{submitted}}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color:#faf8f4;border-top:1px solid #e7dfd2;padding:16px 32px;">
                          <div style="font-size:11px;color:#9a9a94;line-height:1.5;">Sent automatically by Cohabit's safety team. This is an internal notification, please do not reply.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
    }

    private static string Esc(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : WebUtility.HtmlEncode(value);
}
