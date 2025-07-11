# Dependency Graph

- `user_managed_vendors` table -> `products.selected_user_vendor_id`
- API `/api/user-vendors` uses Supabase client
- `VendorListManager` UI fetches `/api/user-vendors`
- `ProductListingForm` requires vendor selection
