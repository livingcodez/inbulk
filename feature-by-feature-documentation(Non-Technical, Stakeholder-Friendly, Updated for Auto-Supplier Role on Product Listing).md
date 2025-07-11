# CrowdCart Lite - Feature Overview

1. **User Authentication**
   - Users sign up and log in using Supabase authentication.
   - Session management keeps users signed in across pages.

2. **Managing Your Source Vendors (New Feature)**
   - **What Users Experience:** In their profile settings, users can now create and manage a personal list of their trusted or preferred suppliers/vendors. For each vendor, they can store details like name, contact information (email, phone, website), address, and notes about the types of products they supply.
   - **How It Works Behind the Scenes:** This information is stored privately for each user. It allows users to maintain a directory of businesses or individuals they intend to source products from.
   - **Where This Happens in the App:** User Profile -> My Managed Vendors.

3. **Wallet Funding and Payments**
   - Users fund a virtual wallet through Paystack.
   - Group buy payments deduct from the wallet or redirect to Paystack if funds are insufficient.

4. **Product Listing (Source Vendor Selection & Auto-Supplier Assignment)**
   - **What Users Experience:** When a user lists a new product for a group buy (whether they intend to supply it themselves or are suggesting a product for the platform's fulfillment arm), they **must now select a "Source Vendor"** from their personal "Managed Vendors" list. This selected source vendor's name (and potentially other non-sensitive details like their website) will be visible to participants in the group buy, offering transparency about where the product comes from.
   - If the user lists the product in "Vendor Mode," they still automatically become the *platform supplier* responsible for that group buy's fulfillment (i.e., they are responsible for obtaining the item from their selected Source Vendor and ensuring it gets to the participants or the fulfillment center).
   - **How It Works Behind the Scenes:** The system links the product listing to the chosen Source Vendor. This information is used to inform participants and, in future enhancements, could guide the platform's fulfillment center if the listing user is not the direct supplier.
   - **Where This Happens in the App:** Vendor Dashboard -> Add New Product / Product Listing Form.
   - Products are treated as fungible by default—there is no option to mark an item as unique.
   - An initial group is always created (timed or untimed) based on vendor preference.

5. **Group Management & Delivery Address Collection (New/Enhanced)**
   - **What Users Experience (Buyers/Participants):**
     - When joining a group for a *physical product* (typically determined by its category, like "Electronics" or "Apparel"), users will be prompted to provide or confirm their delivery address (Full Name, Street Address, City, State, Postal Code, Country, and optionally Phone Number). This usually happens after confirming their intent to join or after payment.
     - Users may be able to select from previously saved addresses in their profile or enter a new one.
     - They will have an option to save a newly entered address to their profile for future use and can mark one of their saved addresses as default.
   - **How It Works Behind the Scenes:** The system identifies physical products based on their category/subcategory. Upon successful group joining for such a product, it triggers the address collection step. Addresses are stored securely, linked to that specific order/group participation. If the user chooses, the address is also saved to their general profile.
   - **Where This Happens in the App:** During the group joining/checkout process for physical goods.
   - Buyers join existing groups or create new ones for listed products.
   - Timed groups expire after a countdown; untimed groups remain open until manually closed.
   - Participants can see information about the declared Source Vendor for the product.

6. **Notifications**
   - Users receive in-app notifications about group activity, payments, and delivery instructions.
   - If a user joins a group for a physical product and doesn't immediately provide an address (e.g., if the prompt is missed or deferred), they may receive a notification reminding them to add their delivery address.

7. **Profile Management (Enhanced)**
   - **Managing Delivery Addresses:** Users can now manage a list of saved delivery addresses within their profile settings. They can add new addresses, edit or delete existing ones, and set one address as their default for faster checkout.
   - **Managing Source Vendors:** (As previously described) Users manage their personal list of source vendors.
   - **Payout Information:** Platform suppliers (vendors) manage their payout bank details.
   - **Where This Happens in the App:** User Profile -> My Saved Addresses; User Profile -> My Managed Vendors.

8. **Order Fulfillment (For Platform Suppliers/Vendors)**
    - **What Users Experience (Platform Suppliers/Vendors):** For completed group buys of physical products they listed, vendors can now access a view showing the list of participants and their submitted delivery addresses.
    - **How It Works Behind the Scenes:** The system provides a secure way for the designated supplier of a completed order to view the necessary shipping information. Access is restricted to only the relevant orders and authorized personnel.
    - **Where This Happens in the App:** Vendor Dashboard -> Orders -> [Specific Completed Order Details].

9. **Payouts (For Platform Suppliers/Vendors)**
   - Platform suppliers (vendors who listed products in vendor mode) manage their listings and request payouts from wallet balances (payout mechanism details might be subject to future updates like batched releases based on delivery confirmation).


*Limitations:*
    - Users cannot currently claim supply of another user’s listing.
    - All products are considered fungible.
    - The platform does not currently vet or endorse user-added Source Vendors; users manage their own lists.
    - The platform does not currently offer integrated shipping label generation or cost calculation; vendors handle their own shipping logistics using the provided addresses.
