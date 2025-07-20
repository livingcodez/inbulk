# Feature Documentation

## User Managed Vendors
- Users can create, edit and delete vendor records.
- Only the owner can access their vendor list.

## Product Listing Vendor Selection
- Listing a product requires picking a vendor from the list.
- The product stores the vendor id for participants to reference.

## Personal Info Modal
- Dark themed card with a green accent bar.
- Displays the user's name and email next to their avatar.
- "Edit Personal Info" button opens the edit modal.
- Edit button shows only a pencil icon with an aria-label.
- "Vendors" button opens the vendor manager modal.
- The header now displays a "Personal Info" label with a user icon while the user's name and email remain next to the avatar.
- The green "See More" bar opens a modal showing phone and shipping address or a notice when none exist.
 - On the profile page, this personal info card now appears directly without an extra wrapper and no duplicate heading text.
 - A small badge sits slightly outside the avatar thumbnail. Clicking it opens an edit modal for pasting an image URL. The input text is dark in light mode and white in dark mode, and the avatar preview refreshes after saving.
  - Avatar URL input resolves non-direct links via `/api/resolve-image` and saves a `/api/thumbnail` URL. Invalid or unreachable links show an error.
  - Session checks now call `supabase.auth.getUser()` before accessing profile data.
  - ProductListingForm resolves indirect image links via a new `/api/resolve-image` service so thumbnails appear correctly.
  - Images are proxied through `/api/thumbnail` which resizes them and keeps the original link.

