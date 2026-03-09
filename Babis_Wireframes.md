# Babis Place - Wireframe Structure

This document outlines the high-level layout and structure for the key screens defined in the User Flow Diagram. You can use these structures as a blueprint when designing high-fidelity UI in Figma or building components in React.

---

## 1. Global Components (Present on most pages)

### Shared Header
- **Top Bar Container:** Sticky at the top
- **Left:** Logo (Babis Place)
- **Center:** Search Bar with category dropdown
- **Right:** 
  - Cart Icon (with notification badge showing item count)
  - User Icon (dropdown for Login/Register OR My Profile/Orders/Logout)
  - Wishlist Icon

### Shared Footer
- **Left Column:** About Us, Contact Info, Social Media Links
- **Center Column:** Quick Links (Shop, FAQs, Terms, Shipping Policy)
- **Right Column:** Newsletter Signup (Input field + Subscribe button)

---

## 2. Customer Pages

### 2.1. Landing / Homepage
- **Hero Section:** Large banner image/carousel with "Shop Now" call-to-action (CTA).
- **Categories Section:** Grid of image cards for top categories (e.g., Electronics, Fashion).
- **Featured Products Section:** Horizontal scroll or grid of product cards.
  - *Product Card:* Image, Title, Price, "Add to Cart" button, empty/filled Wishlist heart.
- **Promotional Banner:** Full-width image for discounts or deals.
- **Footer.**

### 2.2. Product Listing Page (Category/Search Results)
- **Header.**
- **Breadcrumbs:** e.g., `Home > Fashion > Shoes`
- **Page Title & Result Count.**
- **Main Layout (2-Column):**
  - **Left Sidebar (Filters):** Price range slider, Category checkboxes, Ratings filter.
  - **Right Main Area:**
    - *Top Toolbar:* "Sort By" dropdown (Price, Popularity, Newest).
    - *Product Grid:* Displaying product cards.
    - *Bottom:* Pagination controls.
- **Footer.**

### 2.3. Product Details Page
- **Header.**
- **Breadcrumbs.**
- **Main Layout (Split into 2 columns on desktop):**
  - **Left Column (Media):** Large active image, below it a row of smaller thumbnail images.
  - **Right Column (Details & Actions):**
    - Product Title
    - Ratings summary (Stars + count)
    - Price (and discount price if applicable)
    - Short Description
    - Variant Selectors (e.g., Color swatches, Size dropdown)
    - Quantity Selector (- 1 +)
    - Add to Cart Button (Primary CTA) & Wishlist Button (Secondary)
- **Bottom Section (Tabs or Scrolling):**
  - Description Section (Rich text)
  - Specifications/Features
  - FAQs Accordion
  - Customer Reviews (List of text reviews with stars)
- **Footer.**

### 2.4. Cart Slider / Drawer
*(Slides in from the right edge when the Cart icon is clicked)*
- **Header:** "Your Cart (X items)" & Close (X) button.
- **Body:** Scrollable list of cart items.
  - *Cart Item Row:* Thumbnail, Title, Variant (Size), Price, Qty Selector, Remove (Trash/X) icon.
- **Footer Area (Fixed at bottom):**
  - Subtotal amount
  - "Go to Cart" button (Secondary)
  - "Proceed to Checkout" button (Primary)

### 2.5. Checkout Page
- **Minimal Header:** Only Logo (to reduce distractions).
- **Main Layout (2-Column):**
  - **Left Column (Process Forms):**
    - *Step 1: Contact/Auth:* Email/Phone input or "Log in" button.
    - *Step 2: Delivery Method:* Radio buttons for "Delivery" vs. "Pickup".
    - *Step 3: Shipping Details:* Form fields for Address, City, Landmark (or Pickup location selector).
    - *Step 4: Payment:* M-Pesa phone number input.
  - **Right Column (Order Summary - Sticky):**
    - List of items with thumbnails and prices.
    - Subtotal
    - Delivery Fee (Updates based on Step 2/3)
    - Total Amount
    - "Pay Now" Button (Primary CTA, only active when forms are valid).
- **Minimal Footer:** Secure payment badges, Support email.

### 2.6. Order Success Page
- **Center Aligned Layout:**
  - Success Icon (Green Checkmark)
  - "Thank you for your order!"
  - Order Number (e.g., BP-10293)
  - Brief text stating confirmation SMS/Email has been sent.
  - Action Buttons: "View Order Status" & "Continue Shopping".

---

## 3. Auth Pages (Login / Register / OTP)

### 3.1. Authentication Modal or Page
- **Center Box on a dimmed background or clean page:**
  - Logo at top.
  - Toggle Tabs: "Login" | "Register"
  - **Form:** 
    - Phone number input (with country code dropdown).
    - "Send OTP" Button.
  - **OTP State:**
    - Text: "Enter code sent to +254XXXXXXXXX"
    - 4-6 digit numeric input fields.
    - "Verify & Login" Button.
    - "Resend Code" link (with timer).

---

## 4. Admin Dashboard

### 4.1. Admin Global Layout
- **Left Sidebar (Fixed):**
  - Admin Profile Summary
  - Navigation Links (Dashboard, Products, Orders, Users, Categories, Settings, Logout).
- **Top Bar:** Page Title, Search, Notifications Icon.
- **Main Content Area:** Changes based on route.

### 4.2. Dashboard Overview
- **Metric Cards (Top Row):** Total Sales, Active Orders, Total Products, Total Users.
- **Charts Area:** Sales over time (Line/Bar chart).
- **Recent Tables:** Mini-table of last 5 orders, Mini-list of Low Stock products.

### 4.3. Manage Products List
- **Top Actions:** "Add New Product" button, Search bar, Filter by Category.
- **Data Table:**
  - Columns: Image, Name, Category, Price, Stock Status, Actions (Edit icon, Delete icon).
- **Pagination** at bottom.

### 4.4. Add / Edit Product Page
- **Form Layout (Usually grouped into cards):**
  - **Card 1 (Basic Info):** Name input, Category dropdown, Price, Discount Price, Description rich-text editor.
  - **Card 2 (Media):** Drag-and-drop area for image uploads, showing thumbnails of uploaded images.
  - **Card 3 (Inventory & Variants):** Base Stock, Form array to add Variations (Size/Options).
  - **Card 4 (FAQs):** Dynamic array to add Question & Answer pairs.
- **Sticky Bottom/Top Bar:** "Save Product" and "Cancel" buttons.

### 4.5. Manage Orders List
- **Top Actions:** Search by Order Number/Phone, Filter by Status dropdown.
- **Data Table:**
  - Columns: Order #, Date, Customer, Total, Payment Status (Badge), Order Status (Badge), Action (View details).

### 4.6. Order Details Page (Admin)
- **Top:** Order # and Current Status. Action dropdown to "Update Status" (e.g., mark as Delivered).
- **Left Column:** Items ordered list (Thumbnails, Qty, Price).
- **Right Column:** 
  - Customer Info (Name, Phone).
  - Delivery Info (Address or Pickup location).
  - Financial Summary (Subtotal, Fee, Total, M-Pesa Receipt #).
