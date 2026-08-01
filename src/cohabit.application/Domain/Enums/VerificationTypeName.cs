using System.ComponentModel;

namespace cohabit.application.Domain.Enums;

public enum VerificationTypeName
{
    [Description("Identity Document")] IdentityDocument,
    [Description("Passport")] Passport,
    [Description("Driver's License")] DriversLicense,
    [Description("Email")] Email,
    [Description("Phone Number")] PhoneNumber,
    [Description("Proof of Address")] ProofOfAddress
}
