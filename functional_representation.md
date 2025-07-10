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
        *   This component handles the post-payment stage, ensuring buyers receive access to or information about the purchased product/service. For digital goods like software subscriptions, this involves securely sending credentials or access details.
        *   **Depends on:** `Notification System`, `Vendor Product Information`.
        *   *Key files/logic:* `src/lib/supabase/groups.ts` (function `sendSoftwareSubscriptionCredentials` for specific product types), `src/lib/supabase/notifications.ts` (handles creation of notifications), `src/lib/supabase/products.ts` (stores product details including subscription info if applicable).

    *   **Underpinning Systems & Primitives:**
        *   These are foundational elements required for the above core processes to function.

        *   **User Management & Authentication**
            *   Manages user accounts, profiles (including vendor/buyer roles), login, registration, and session handling. Essential for identifying users, securing access, and tailoring experiences.
            *   **Depends on:** `Authentication Service (Supabase Auth)`, `User Profile Storage`.
            *   *Key files/logic:* `src/app/auth/`, `src/lib/supabase/user.ts` (profile operations), `src/lib/supabase/server.ts` & `src/lib/supabase/supabaseClient.ts` (Supabase client setup), `src/middleware.ts` (route protection).

        *   **Product Management System**
            *   Allows vendors to list products, define properties (price, category, description, images, group targets like `max_participants`) and manage their active listings. Products are treated as fungible by default, so no user input is required for uniqueness. Buyers use this system to discover and view products.
            *   **Depends on:** `Product Data Storage`, `Vendor Interface for Product Listing`, `Buyer Interface for Product Discovery`.
            *   *Key files/logic:* `src/lib/supabase/products.ts` (CRUD operations for products, fetching live products), `src/app/products/`, `src/components/products/ProductListingForm.tsx`, `src/components/products/ProductCard.tsx`, `src/app/dashboard/page.tsx` (Vendor Mode for listings, Buyer Mode for exploring).

        *   **Group Management System (Detailed)**
            *   Facilitates the creation of groups (often automatically upon product listing or manually by users), discovery of existing groups, joining/leaving groups, and group administration (e.g., by group creators or implicitly by system rules). Tracks group status (open, waiting_votes, closed, completed), member counts, and voting processes if applicable.
            *   **Depends on:** `Group Data Storage`, `User Interface for Group Interaction & Management`.
            *   *Key files/logic:* `src/lib/supabase/groups.ts` (CRUD for groups & members, fetching groups by various criteria), `src/components/products/GroupCard.tsx`, `src/components/dashboard/JoinedGroupCard.tsx`, `src/app/dashboard/page.tsx` (Buyer Mode - My Groups).

        *   **User Wallet System**
            *   Allows users to maintain a balance on the platform. Users can fund their wallets (e.g., via Paystack deposit) and use this balance for group buy payments.
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
            *   Product Management System (`src/lib/supabase/products.ts` - e.g., `max_participants` used as `target_count`)
        *   `User Participation` (Users finding and joining groups)
            *   User Management & Authentication (ensures valid users interact)
            *   Product Discovery (leading to group discovery)
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
        *   `Vendor Product Information` (Source of delivery details, e.g., subscription credentials stored with product)
            *   Product Management System (`src/lib/supabase/products.ts`)
    *   **Underpinning Systems & Primitives (Supporting the entire platform)**
        *   `User Management & Authentication`
            *   Authentication Service (Supabase Auth via `src/lib/supabase/server.ts`, `src/lib/supabase/supabaseClient.ts`)
            *   User Profile Storage & Management (`src/lib/supabase/user.ts`, `user_profiles` table)
            *   Session Management & Route Protection (`src/middleware.ts`, Next.js routing)
            *   Login/Registration UI (`src/app/login/page.tsx`, `src/app/auth/callback/route.ts`)
        *   `Product Management System`
            *   Product Data Storage & Logic (`src/lib/supabase/products.ts`, `products` table)
            *   Product Creation/Listing UI & Logic (`src/components/products/ProductListingForm.tsx`, `src/lib/supabase/products.ts` - `createProduct`)
            *   Product Discovery/Browsing UI & Logic (`src/app/dashboard/page.tsx` - Buyer explore, `src/lib/supabase/products.ts` - `getLiveProducts`)
            *   Vendor Product Management UI (`src/app/dashboard/page.tsx` - Vendor "My Listings")
        *   `User Interface (UI Framework & Components)`
            *   Frontend Framework (Next.js - structure in `src/app/`)
            *   Global Styles & Layout (`src/app/layout.tsx`, `src/app/globals.css`)
            *   Reusable UI Components (`src/components/ui/`, `src/components/layout/`, etc.)
            *   Dashboard Shell & Navigation (`src/app/dashboard/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`)
            *   State Management (React state, context, server components)
        *   `Database (Supabase Postgres)`
            *   Schema Definitions (SQL files like `notifications.sql`, `wallet_transactions.sql`, and implicit table structures via Supabase UI/migrations)
            *   Data Access Layer (Supabase client in `src/lib/supabase/`)
            *   Stored Procedures/RPCs (e.g., `get_distinct_categories` in `src/lib/supabase/products.ts`)

---
