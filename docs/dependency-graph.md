# Dependency Graph

- `user_managed_vendors` table -> `products.selected_user_vendor_id`
- API `/api/user-vendors` uses Supabase client
- `VendorListManager` UI fetches `/api/user-vendors`
- `ProductListingForm` requires vendor selection
- `PersonalInfoModal` uses `updateProfile` from SupabaseProvider
- `PersonalInfoViewModal` reads phone and address from SupabaseProvider
- `PersonalInfoSection` uses dark theme layout with Edit and Vendors buttons
- `VendorManagerModal` wraps `VendorListManager`
- `PersonalInfoSection` opens `PersonalInfoViewModal` when See More is clicked
- `ProfilePage` embeds `PersonalInfoSection` directly without a surrounding `Card`
- `AvatarEditModal` updates `user_profiles.avatar_url` via `updateProfile`
- Avatar badge outside thumbnail opens `AvatarEditModal` and refreshed avatar
- Next.js remotePatterns permit remote avatar URLs
- Avatar URL input validates extension before updating profile
- AvatarEditModal resolves indirect links via `/api/resolve-image` and saves `/api/thumbnail` URL
- `resolve-image` API fetches OG images from provided URLs and ProductListingForm consumes it for thumbnail previews
- `/api/thumbnail` streams resized images and stores original links

