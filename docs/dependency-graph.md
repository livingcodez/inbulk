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
