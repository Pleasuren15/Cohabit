using System.ComponentModel;

namespace cohabit.application.Domain.Enums;

public enum ListingTypeName
{
    [Description("Room")] Room,
    [Description("Studio")] Studio,
    [Description("Apartment")] Apartment,
    [Description("Flat")] Flat,
    [Description("House")] House,
    [Description("Townhouse")] Townhouse,
    [Description("Cottage")] Cottage,
    [Description("Guest House")] GuestHouse,
    [Description("Backpacker Lodge")] BackpackerLodge
}
