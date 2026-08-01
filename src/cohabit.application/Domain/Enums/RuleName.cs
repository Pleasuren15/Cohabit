using System.ComponentModel;

namespace cohabit.application.Domain.Enums;

public enum RuleName
{
    [Description("No Smoking")] NoSmoking,
    [Description("No Pets")] NoPets,
    [Description("No Parties")] NoParties,
    [Description("No Alcohol")] NoAlcohol,
    [Description("No Drugs")] NoDrugs,
    [Description("Quiet Hours")] QuietHours,
    [Description("No Guests")] NoGuests,
    [Description("Visitors Allowed")] VisitorsAllowed
}
