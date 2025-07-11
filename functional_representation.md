# Functional Representation of CrowdCart Lite

## 1. Top Root Node

The **top root node** for this application is: "**Successfully Complete a Group Purchase Transaction.**" This is the ultimate goal that all other functions and modules compute towards, representing the core value proposition of the platform – facilitating group buys from product listing to fulfillment.

---

## 2. & 3. Causal Tree and Dependency Explanation

The application's dependencies are mapped below. Each component contributes to the final goal of successfully completing a group purchase transaction.

*   **Successfully Complete a Group Purchase Transaction** (Root Node)
    *   This is the ultimate goal where a group of buyers successfully acquires a product/service offered by a vendor. It signifies the fulfillment of a group's objective, successful payment, and initiation of product/service delivery.
    *   **Depends on:** `Group Finalization`, `Payment Processing`, and `Product/Service Delivery Confirmation`.

    *   **Group Finalization**
        *   This component ensures that a group meets all necessary criteria to proceed with a purchase. This involves forming a group, reaching target member counts, or successfully passing a vote if required for certain group types or products.
        *   **Depends on:** `Group Management System`, `Product Configuration`, `User Participation`.
        *   *Key files/logic:* `src/lib/supabase/groups.ts` (managing group status, members, voting logic, checking target counts), `src/lib/supabase/products.ts` (products define `max_participants` which groups use as `target_count`).

    *   **Payment Processing**
        *   This component handles the financial settlement for the group purchase. It involves collecting funds from participating members, either from their platform wallets or through an external payment gateway (Paystack).
        *   **Depends on:** `User Wallet System`, `External Payment Gateway Integration`, `Transaction Recording`.
        *   *Key files/logic:* `src/app/api/group-payment/route.ts` (orchestrates wallet debit or Paystack payment initialization), `src/lib/supabase/wallet.ts` (manages wallet balance updates), `src/app/api/webhook/route.ts` (handles Paystack webhook for payment confirmation), `wallet_transactions.sql` (schema for transaction table).

    *   **Product/Service Delivery Confirmation**
            *   This component handles the post-payment stage.
            *   For *digital goods* (e.g., software subscriptions), this involves securely sending credentials or access details, often via the `Notification System`.
            *   For *physical goods*, this stage now relies on the `Participant Address Management` system to provide necessary delivery information to the fulfiller (platform vendor or fulfillment center). The fulfiller then handles external shipping logistics.
            *   **Depends on:** `Notification System`, `Vendor Product Information` (including source vendor), `Participant Address Management` (for physical goods), `Product Physicality Determination`.
            *   *Key files/logic:*
                *   Digital: `src/lib/supabase/groups.ts` (`sendSoftwareSubscriptionCredentials`), `src/lib/supabase/notifications.ts`.
                *   Physical: `src/lib/supabase/addresses.ts` (`getDeliveryAddressesForGroup`), `src/app/api/groups/[groupId]/delivery-addresses/route.ts` (fulfiller API), `src/components/dashboard/OrderDeliveryDetails.tsx` (fulfiller UI).

    *   **Underpinning Systems & Primitives:**
        *   These are foundational elements required for the above core processes to function.

        *   **User Management & Authentication**
            *   Manages user accounts, profiles (including vendor/buyer roles, saved delivery addresses), login, registration, and session handling.
            *   **Depends on:** `Authentication Service (Supabase Auth)`, `User Profile Storage`.
            *   *Key files/logic:* `src/app/auth/`, `src/lib/supabase/user.ts`, `src/lib/supabase/addresses.ts` (for profile addresses), `src/app/api/profile/addresses/`, `src/app/profile/addresses/page.tsx`, `src/lib/supabase/server.ts` & `src/lib/supabase/supabaseClient.ts`, `src/middleware.ts`.

        *   **User-Managed Vendor Data Management**
            *   Allows users to create, manage, and store a personal list of their preferred external source vendors. This information is used during product listing.
            *   **Depends on:** `User Authentication`, `Database for storage`.
            *   *Key files/logic:* `src/lib/supabase/userVendors.ts`, `src/app/api/user-vendors/`, `src/app/profile/vendors/page.tsx`.

        *   **Product Physicality Determination (New Logic Component)**
            *   Logic to determine if a product is physical (requiring delivery address) or digital.
            *   Primarily based on product category/subcategory mapping (e.g., from a `category_properties` table). May include an optional manual override flag (`is_physical_product`) on the product itself.
            *   **Depends on:** `Product Data Storage` (category, subcategory, override flag), `Category Properties Data Storage`.
            *   *Key files/logic:* `src/lib/supabase/products.ts` (new `isProductPhysical` function), `category_properties` DB table (schema defined).

        *   **Product Management System**
            *   Allows users to list products, defining properties (price, category, subcategory, etc.).
            *   Requires selection of a source vendor from "User-Managed Vendor" list.
            *   May include an optional `is_physical_product` override flag.
            *   **Depends on:** `Product Data Storage`, `User-Managed Vendor Data Management`, `Product Physicality Determination` (implicitly, as product properties feed into this), `Vendor Interface for Product Listing`, `Buyer Interface for Product Discovery`.
            *   *Key files/logic:* `src/lib/supabase/products.ts` (CRUD, `isProductPhysical`), `src/app/api/products/route.ts`, `src/components/products/ProductListingForm.tsx` (vendor selection, physical flag).

        *   **Participant Address Management (New)**
            *   Handles collection, storage, and retrieval of delivery addresses for participants in group buys of physical products.
            *   Includes per-group-participation addresses and optional saving of addresses to user profiles.
            *   Provides secure access for fulfillers to retrieve addresses for completed orders.
            *   **Depends on:** `User Authentication`, `Group Membership Data`, `Product Physicality Determination` (to trigger collection), `Database for storage`.
            *   *Key files/logic:* `src/lib/supabase/addresses.ts` (participant and profile address functions), `src/app/api/groups/[groupId]/members/[memberId]/delivery-address/route.ts`, `src/app/api/groups/[groupId]/delivery-addresses/route.ts`, `src/app/api/profile/addresses/`, `src/components/forms/DeliveryAddressForm.tsx`, `src/app/profile/addresses/page.tsx`, `src/components/dashboard/OrderDeliveryDetails.tsx`.

        *   **Group Management System (Detailed)**
            *   Facilitates group creation, discovery, joining/leaving, and administration.
            *   Triggers address collection notification if a product is physical upon a user joining (via `joinGroup` modification).
            *   Participants can view source vendor details.
            *   **Depends on:** `Group Data Storage`, `User Interface for Group Interaction`, `Product Physicality Determination` (for `joinGroup` logic).
            *   *Key files/logic:* `src/lib/supabase/groups.ts` (updated `joinGroup`), `src/components/products/GroupCard.tsx`, `src/components/dashboard/JoinedGroupCard.tsx`.

        *   **User Wallet System**
            *   Allows users to maintain a balance on the platform.
            *   **Depends on:** `Wallet Data Storage`, `Funding Mechanism (Paystack Integration for Deposits)`.
            *   *Key files/logic:* `src/lib/supabase/wallet.ts` (wallet balance operations), `src/app/api/deposit/route.ts` (initiating wallet funding), `src/app/api/fund-wallet/route.ts` (frontend wrapper for deposit), `src/components/profile/WalletCard.tsx`, `src/components/profile/FundWalletModal.tsx`.

        *   **Notification System**
            *   Informs users about important events relevant to them, such as group join/leave confirmations, group status changes (e.g., group filled, vote started/ended), payment confirmations, or delivery of credentials/product access information.
            *   **Depends on:** `Notification Data Storage`, `User Interface for Displaying Notifications`.
            *   *Key files/logic:* `src/lib/supabase/notifications.ts` (creating and fetching notifications), `notifications.sql` (schema), `src/components/notifications/NotificationList.tsx`, `src/components/layout/Header.tsx` (notification icon).

        *   **Transaction Recording System**
            *   Logs all financial movements, including wallet deposits, escrow payments for group buys, and potentially payouts to vendors or refunds. Essential for auditing, user transaction history, and system financial integrity.
            *   **Depends on:** `Transaction Data Storage`.
            *   *Key files/logic:* `src/app/api/group-payment/route.ts` & `src/app/api/webhook/route.ts` (inserting transaction records), `wallet_transactions.sql` (schema).

        *   **User Interface (UI Components & Pages)**
            *   Provides the visual and interactive means for users (buyers and vendors) to engage with all platform functionalities. This includes dashboards, forms, product displays, group interaction elements, etc.
            *   **Depends on:** `Frontend Framework (Next.js)`, `UI Component Library (Custom components, TailwindCSS, shadcn/ui)`.
            *   *Key files/logic:* Entire `src/app/` directory for pages, `src/components/` for reusable UI elements, `tailwind.config.js`, `src/app/globals.css`.

---

## 4. Functional Representation (Hierarchical List)

*   **[Top Root Node] Successfully Complete a Group Purchase Transaction**
    *   `Group Finalization`
        *   `Group Management System`
            *   Group Data Storage & Logic (`src/lib/supabase/groups.ts`)
                *   Group Status Management (open, waiting_votes, closed, completed)
                *   Member Management (join, leave, count tracking)
                *   Voting Mechanism & Logic (if applicable)
            *   User Interface for Group Interaction (`src/components/products/GroupCard.tsx`, `src/components/dashboard/JoinedGroupCard.tsx`)
            *   Automated Group Creation (on product listing, `src/lib/supabase/products.ts` calling `createGroup`)
        *   `Product Configuration` (Defines group targets, type, from `products` table)
            *   Product Management System (`src/lib/supabase/products.ts` - e.g., `max_participants` used as `target_count`, now also includes `selected_user_managed_vendor_id` to identify source)
        *   `User Participation` (Users finding and joining groups)
            *   User Management & Authentication (ensures valid users interact)
            *   Product Discovery (leading to group discovery, includes viewing source vendor info)
    *   `Payment Processing`
        *   `User Wallet System`
            *   Wallet Data Storage & Logic (`src/lib/supabase/wallet.ts`)
            *   Wallet Funding (`src/app/api/deposit/route.ts`, `src/components/profile/FundWalletModal.tsx`)
            *   Wallet Balance Check & Debit (`src/app/api/group-payment/route.ts`)
        *   `External Payment Gateway Integration (Paystack)`
            *   Initialize Payment via Paystack API (`src/app/api/group-payment/route.ts`)
            *   Webhook Handling for Payment Confirmation from Paystack (`src/app/api/webhook/route.ts`)
        *   `Transaction Recording System`
            *   Transaction Data Storage (`wallet_transactions.sql` schema)
            *   Logging Payments & Wallet Transactions (`src/app/api/group-payment/route.ts`, `src/app/api/webhook/route.ts`)
    *   `Product/Service Delivery Confirmation`
        *   `Notification System`
            *   Notification Data Storage & Logic (`src/lib/supabase/notifications.ts`, `notifications.sql` schema)
            *   Create & Dispatch Notification (`src/lib/supabase/notifications.ts` - `createNotification`)
            *   Automated Credential/Access Dispatch (e.g., `src/lib/supabase/groups.ts` - `sendSoftwareSubscriptionCredentials` which uses notifications)
        *   `Vendor Product Information` (Source of delivery details, e.g., subscription credentials stored with product, now also includes the declared Source Vendor from `user_managed_vendors` via `products.selected_user_managed_vendor_id`)
            *   Product Management System (`src/lib/supabase/products.ts`)
            *   User-Managed Vendor Data Management (`src/lib/supabase/userVendors.ts`)
            *   Participant Address Management (`src/lib/supabase/addresses.ts`)
    *   **Underpinning Systems & Primitives (Supporting the entire platform)**
        *   `User Management & Authentication`
            *   Authentication Service (Supabase Auth)
            *   User Profile Storage & Management (`src/lib/supabase/user.ts`, `user_profiles` table, including saved addresses logic in `src/lib/supabase/addresses.ts`)
            *   Session Management & Route Protection
            *   Login/Registration UI
        *   `User-Managed Vendor Data Management`
            *   User-Specific Vendor Data Storage & Logic (`src/lib/supabase/userVendors.ts`, `user_managed_vendors` table).
            *   Vendor Management UI (`src/app/profile/vendors/page.tsx`, `AddEditVendorModal.tsx`).
            *   API for Vendor CRUD (`src/app/api/user-vendors/`).
        *   `Product Physicality Determination`
            *   Logic (`src/lib/supabase/products.ts` - `isProductPhysical` function)
            *   Data Storage (`category_properties` table, optional `is_physical_product` on `products` table)
        *   `Product Management System`
            *   Product Data Storage & Logic (`src/lib/supabase/products.ts`, `products` table, with `selected_user_managed_vendor_id`).
            *   Product Creation/Listing UI & Logic (`src/components/products/ProductListingForm.tsx`, `src/lib/supabase/products.ts` - `createProduct`).
            *   Product Discovery/Browsing UI & Logic.
            *   Vendor Product Management UI.
        *   `Participant Address Management`
            *   Participant-Specific Address Storage & Logic (`src/lib/supabase/addresses.ts`, `participant_delivery_addresses` table)
            *   User Profile Saved Address Storage & Logic (`src/lib/supabase/addresses.ts`, `user_profile_addresses` table)
            *   Address Collection UI (`src/components/forms/DeliveryAddressForm.tsx`, integration into group join flow)
            *   Profile Address Management UI (`src/app/profile/addresses/page.tsx`)
            *   Fulfiller Address View UI (`src/components/dashboard/OrderDeliveryDetails.tsx`)
            *   APIs for Address Operations (`/api/groups/.../delivery-address`, `/api/profile/addresses/`)
        *   `User Interface (UI Framework & Components)`
            *   Frontend Framework (Next.js)
            *   Global Styles & Layout
            *   Reusable UI Components (`src/components/ui/`, `src/components/layout/`, etc.)
            *   Dashboard Shell & Navigation (`src/app/dashboard/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`)
            *   State Management (React state, context, server components)
        *   `Database (Supabase Postgres)`
            *   Schema Definitions (SQL files like `notifications.sql`, `wallet_transactions.sql`, and implicit table structures via Supabase UI/migrations)
            *   Data Access Layer (Supabase client in `src/lib/supabase/`)
            *   Stored Procedures/RPCs (e.g., `get_distinct_categories` in `src/lib/supabase/products.ts`)

---
