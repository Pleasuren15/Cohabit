using System.ComponentModel;

namespace cohabit.application.Domain.Enums;

public enum AmenityName
{
    [Description("High Speed WiFi")] HighSpeedWifi,
    [Description("Parking")] Parking,
    [Description("Swimming Pool")] SwimmingPool,
    [Description("Gym")] Gym,
    [Description("Laundry")] Laundry,
    [Description("Furnished")] Furnished,
    [Description("Air Conditioning")] AirConditioning,
    [Description("Balcony")] Balcony,
    [Description("Security")] Security,
    [Description("Pet Friendly")] PetFriendly,
    [Description("Cleaning Service")] CleaningService,
    [Description("Solar Power")] SolarPower
}
