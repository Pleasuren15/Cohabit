using cohabit.api.Contracts;
using cohabit.application.Domain;

namespace cohabit.api.Helpers;

internal static class ListingMapper
{
    public static ListingSummaryDto ToSummary(Listing listing)
    {
        return new ListingSummaryDto(
            listing.Id,
            listing.Title,
            listing.Description,
            listing.TypeId,
            listing.Type.Name,
            listing.Price,
            listing.Deposit,
            listing.Beds,
            listing.Baths,
            listing.AvailableFrom,
            listing.ResponseTime,
            PrimaryImageUrl(listing),
            ToOwner(listing.User),
            ToAddress(listing.Address));
    }

    public static ListingDetailDto ToDetail(Listing listing)
    {
        return new ListingDetailDto(
            listing.Id,
            listing.Title,
            listing.Description,
            listing.TypeId,
            listing.Type.Name,
            listing.Price,
            listing.Deposit,
            listing.Beds,
            listing.Baths,
            listing.AvailableFrom,
            listing.ResponseTime,
            PrimaryImageUrl(listing),
            ToOwner(listing.User),
            ToAddress(listing.Address),
            listing.Images
                .OrderByDescending(i => i.IsPrimary)
                .Select(i => i.Url)
                .ToList(),
            listing.ListingAmenities
                .Select(la => la.Amenity.Name)
                .ToList(),
            listing.ListingRules
                .Select(lr => lr.Rule.Name)
                .ToList(),
            listing.User.UserVerifications
                .Select(uv => new ListingVerificationDto(
                    uv.VerificationType.Id,
                    uv.VerificationType.Name,
                    uv.IsVerified))
                .ToList());
    }

    private static ListingOwnerDto ToOwner(User user)
    {
        return new ListingOwnerDto(user.Id, user.FirstName, user.LastName, user.AvatarUrl);
    }

    private static ListingAddressDto ToAddress(Address address)
    {
        return new ListingAddressDto(
            address.Suburb,
            address.PostalCode,
            new ProvinceDto(address.Province.Id, address.Province.Name));
    }

    private static string? PrimaryImageUrl(Listing listing)
    {
        return listing.Images
            .OrderByDescending(i => i.IsPrimary)
            .Select(i => i.Url)
            .FirstOrDefault();
    }
}
