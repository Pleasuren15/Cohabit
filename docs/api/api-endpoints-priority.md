# API Endpoint Wiring Priority

## Purpose

The API models, database schema, and lookup seeders are in place. This document
lists the REST endpoints the web app (`cohabit.web`) needs, ranked from most
important to least important based on how the app is actually used.

Each entry maps an endpoint to the UI screen/component it powers and the
tables it touches so the wiring work can be planned and parallelised.

---

## Existing Endpoints (already wired)

| Method | Path | Service | Notes |
|--------|------|---------|-------|
| POST | `/auth/sync` | `cohabit.api` | Syncs JWT user into `users` table |
| GET | `/files` | `cohabit.api` | List blob files |
| GET | `/files/{name}` | `cohabit.api` | Download a blob |
| POST | `/files` | `cohabit.api` | Upload a blob (image uploads) |
| GET | `/messages` | `comms.api` | BulkSMS messages |
| GET | `/messages/{id}` | `comms.api` | BulkSMS message by id |
| POST | `/send` | `comms.api` | Send an SMS via BulkSMS |

Everything below is **not yet wired** and is what the web app needs next.

---

## Tier 1 — Browsing (core product loop)

The whole app is a marketplace. Without reading listings nothing else matters.
This tier is the home screen, landing province picker, and listing detail page.

### 1. `GET /api/listings` — Browse listings
- **Powers:** Home tab (`MainApp` → `filteredProfiles`), `ExpandableProfileCard`, search + `ListingFilter`, province filter.
- **Query params:** `provinceId`, `type` (`roommate` | `rentals`), `q` (search), `page`, `pageSize`.
- **Tables:** `listings`, `addresses`, `provinces`, `listing_types`, `images`, `users`, `listing_amenities`, `listing_rules`.
- **Auth:** optional (public browse).
- **Why #1:** The Home feed is the first and most-visited screen.

### 2. `GET /api/listings/{id}` — Listing detail
- **Powers:** `DetailPage`, related-listings logic, "Request View" entry point.
- **Tables:** everything #1 returns plus full `images`, `amenities`, `rules`, owner `user_verifications`.
- **Auth:** optional.
- **Why #2:** Tapping any card opens this; it is the conversion screen.

### 3. `GET /api/provinces` — Province lookup
- **Powers:** Landing page `Select33`, province picker overlay, Home filter button.
- **Tables:** `provinces`.
- **Auth:** none.
- **Why #3:** Required on first render — the user cannot enter the app without choosing a province.

---

## Tier 2 — Accounts & Auth

Without an authenticated user, favourites, messaging, listings, and verification
have no owner. The UI currently mocks `MOCK_USER`.

### 4. `POST /api/auth/login` and `POST /api/auth/register`
- **Powers:** `Auth3` overlay (Sign in / Create account tabs).
- **Tables:** `users` (register), JWT issuance.
- **Auth:** none.
- **Why #4:** Gates every personalised feature behind it. Currently the API only has `/auth/sync` (post-issuance), not credential login.

### 5. `GET /api/users/me` — Current user profile
- **Powers:** `UserProfile` header, `EditProfile` initial data, Profile tab.
- **Tables:** `users`, `addresses`, `provinces`, `user_verifications`.
- **Auth:** required.

### 6. `PUT /api/users/me` — Update profile
- **Powers:** `EditProfile` save (`onUpdateUser`), avatar upload.
- **Tables:** `users`, `addresses`.
- **Auth:** required.

---

## Tier 3 — WatchList (favourites)

Favouriting is a lightweight but heavily used interaction on every card and in
the detail page.

### 7. `GET /api/users/me/watchlist` — List favourites
- **Powers:** WatchList tab `MinimalCarousel`.
- **Tables:** `watch_list`, `listings`, `images`.
- **Auth:** required.

### 8. `POST /api/users/me/watchlist/{listingId}` — Add favourite
- **Powers:** Heart toggle on `ExpandableProfileCard`, `DetailPage`, carousels.
- **Tables:** `watch_list`.
- **Auth:** required.

### 9. `DELETE /api/users/me/watchlist/{listingId}` — Remove favourite
- **Powers:** Heart toggle off.
- **Tables:** `watch_list`.
- **Auth:** required.

---

## Tier 4 — Owner listings & creation

The Profile tab ("My Listings" + the 6-step "New Listing" wizard) and the
file upload for photos.

### 10. `GET /api/users/me/listings` — My listings
- **Powers:** Profile tab "My Listings" carousel.
- **Tables:** `listings`, `addresses`, `images`.
- **Auth:** required.

### 11. `POST /api/listings` — Create listing
- **Powers:** `UserProfile` new-listing wizard (`onAddListing`).
- **Request body:** title, description, typeId, price, deposit, beds, baths, availableFrom, responseTime, address (line1/line2/suburb/postalCode/provinceId), amenityIds, ruleIds.
- **Tables:** `listings`, `addresses`, `listing_amenities`, `listing_rules`.
- **Auth:** required.
- **Why #11:** The app only shows user-created listings after this succeeds; it also drives the post-auth onboarding of supply side.

### 12. `PUT /api/listings/{id}` — Update listing
- **Powers:** Editing an existing listing.
- **Tables:** `listings`, `addresses`, `listing_amenities`, `listing_rules`.
- **Auth:** required (owner only).

### 13. `DELETE /api/listings/{id}` — Delete listing
- **Powers:** Removing a listing.
- **Tables:** `listings` (cascades images/watchlists/amenities/rules/conversations).
- **Auth:** required (owner only).

### 14. `POST /api/listings/{id}/images` (uses existing `POST /files`)
- **Powers:** Step 6 "Photos" of the new-listing wizard and profile avatar.
- **Tables:** `images` (URL refs to blob storage).
- **Auth:** required.

### 15. `GET /api/listing-types`, `GET /api/amenities`, `GET /api/rules` — Form lookups
- **Powers:** Listing wizard (type choice, amenity chips), detail page labels.
- **Tables:** `listing_types`, `amenities`, `rules`.
- **Auth:** none.
- **Why #15:** Bundled here because they only matter inside listing creation/editing flows.

---

## Tier 5 — Messaging (conversations)

The Messages tab currently shows static mock notifications, and the detail page's
"Request View" currently just jumps to Messages.

### 16. `GET /api/conversations` — Thread list
- **Powers:** Messages tab (`PinItemComponent`).
- **Tables:** `conversations`, `listings`, `users`, `messages` (last message).
- **Auth:** required (participant only).

### 17. `GET /api/conversations/{id}/messages` — Thread messages
- **Powers:** Opening a thread (unread count, message history).
- **Tables:** `messages`, `users`.
- **Auth:** required (participant only).

### 18. `POST /api/conversations` — Start conversation (Request View)
- **Powers:** `DetailPage` "Request View" button.
- **Request body:** `listingId`, `tenantUserId` (or derive from listing owner).
- **Tables:** `conversations`.
- **Auth:** required.

### 19. `POST /api/conversations/{id}/messages` — Send message
- **Powers:** Composing a message in a thread.
- **Tables:** `messages`.
- **Auth:** required (participant only).

### 20. `PATCH /api/messages/{id}/read` — Mark as read
- **Powers:** Unread badge clearing on open.
- **Tables:** `messages`.
- **Auth:** required.

---

## Tier 6 — Verification & OTP (SMS)

Feeds the "Verification Badges" section in Profile and the Info tab.

### 21. `GET /api/users/me/verifications` — My verification status
- **Powers:** Profile verification chips (`onVerify` state).
- **Tables:** `user_verifications`, `verification_types`.
- **Auth:** required.

### 22. `POST /api/auth/otp/request` — Request phone OTP
- **Powers:** Phone verification (uses `comms.api` `POST /send` under the hood).
- **Tables:** `users` (cellphone), `user_verifications`.
- **Auth:** required.

### 23. `POST /api/auth/otp/verify` — Confirm OTP
- **Powers:** Sets `is_otp_verified` and/or phone `user_verification`.
- **Tables:** `users`, `user_verifications`.
- **Auth:** required.

### 24. `POST /api/users/me/verifications` — Complete a verification type
- **Powers:** Profile "Verify" dialog (phone/email/id/credit).
- **Tables:** `user_verifications`.
- **Auth:** required.

---

## Tier 7 — Lookups (secondary / admin)

### 25. `GET /api/verification-types`
- **Powers:** Verify dialog labels; Info tab badge tabs.
- **Tables:** `verification_types`.
- **Auth:** none.

### 26. `GET /api/users/{id}` — Public user profile
- **Powers:** Viewing a listing owner's public profile/verifications.
- **Tables:** `users`, `user_verifications`, `listings`.
- **Auth:** none.
- **Why #26:** Nice-to-have trust feature, not blocking any current screen.

---

## Suggested build order

| Phase | Endpoints | Unlocks |
|-------|-----------|---------|
| 1 | Listings list + detail, provinces | Public browse (app is usable) |
| 2 | Login/register, me, update me | Personalisation begins |
| 3 | Watchlist CRUD | Favourites |
| 4 | My listings, create/update/delete, images, form lookups | Host supply side |
| 5 | Conversations + messages | Real messaging |
| 6 | Verifications + OTP | Trust badges |
| 7 | Remaining lookups / public profiles | Polish |
