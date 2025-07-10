# CrowdCart Lite - Feature Overview

1. **User Authentication**
   - Users sign up and log in using Supabase authentication.
   - Session management keeps users signed in across pages.

2. **Wallet Funding and Payments**
   - Users fund a virtual wallet through Paystack.
   - Group buy payments deduct from the wallet or redirect to Paystack if funds are insufficient.

3. **Product Listing (Auto-Supplier Assignment)**
   - Vendors list new products from their dashboard. The listing vendor automatically becomes the supplier for the first group created.
   - Products are treated as fungible by default—there is no option to mark an item as unique.
   - An initial group is always created (timed or untimed) based on vendor preference.

4. **Group Management**
   - Buyers join existing groups or create new ones for listed products.
   - Timed groups expire after a countdown; untimed groups remain open until manually closed.

5. **Notifications**
   - Users receive in-app notifications about group activity, payments and delivery instructions.

6. **Profile & Payouts**
   - Vendors manage listings and request payouts from wallet balances.

*Limitations:* Users cannot claim supply of another vendor’s listing, and all products are considered fungible.
