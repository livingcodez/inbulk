# Functional Representation

1. User manages a private list of suppliers.
2. Product listing form fetches this list and requires one to be selected.
3. Selected vendor id is stored with the product so group participants can see supplier details.
4. PersonalInfoModal allows editing name, phone and address with updates saved on close.
5. Personal info card uses a dark theme with green accent. The header displays a "Personal Info" label with a user icon while the user's name appears beside their avatar. The edit button is icon-only with a pencil and accessible aria-label. A green "See More" bar opens a modal showing phone and address if available.
6. Profile page embeds this personal info card directly without an outer wrapper to avoid duplicate headings.
7. Users can update their profile picture through an avatar edit modal that accepts an image URL.
8. An edit badge sits slightly outside the avatar thumbnail and opens the modal.
9. The avatar refreshes after saving a new URL and the input text remains visible in both themes.
