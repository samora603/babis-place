# Babis E-commerce API Routes Mapping

Based on the existing Express backend, here is the complete map of API endpoints needed for the frontend application to function according to the defined user flows.

> [!NOTE]
> - Base API URL: `/api/v1` (or according to your server config)
> - `protect`: Requires valid JWT Token in `Authorization` header (`Bearer <token>`)
> - `adminOnly`: Requires user `role` to be `'admin'`

## 1. Authentication & Users
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/request-otp` | `POST` | Public | Initiates OTP login/register | `{ phone }` |
| `/api/auth/verify-otp` | `POST` | Public | Verifies OTP and returns JWT | `{ phone, code }` |
| `/api/auth/refresh-token` | `POST` | Public | Gets new access token | `{ refreshToken }` |
| `/api/auth/logout` | `POST` | `protect` | Logs out user | - |
| `/api/auth/me` | `GET` | `protect` | Get current logged-in user info | - |
| `/api/users/profile` | `GET` | `protect` | Get user profile details | - |
| `/api/users/profile` | `PUT` | `protect` | Update profile info | `{ name, email, etc. }` |
| `/api/users/addresses` | `POST` | `protect` | Add a new delivery address | `{ label, street, building... }` |
| `/api/users/addresses/:id` | `PUT` / `DELETE`| `protect` | Manage specific address | Params: `id` |

---

## 2. Product Catalog & Categories
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Public | List products (Search, Filter, Paginate) | Query: `?search, ?category, ?page` |
| `/api/products/:idOrSlug` | `GET` | Public | Get single product details | Params: `idOrSlug` |
| `/api/categories` | `GET` | Public | List all categories | - |
| `/api/categories/:id` | `GET` | Public | Get single category details | Params: `id` |

---

## 3. Cart Management
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/cart` | `GET` | `protect` | Get user's current cart | - |
| `/api/cart` | `POST` | `protect` | Add item to cart | `{ productId, quantity, variation }`|
| `/api/cart/:itemId` | `PUT` | `protect` | Update item quantity in cart | `{ quantity }` |
| `/api/cart/:itemId` | `DELETE`| `protect` | Remove item from cart | Params: `itemId` |
| `/api/cart` | `DELETE`| `protect` | Clear entire cart | - |

---

## 4. Checkout & Orders
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/orders` | `POST` | `protect` | Create a new order (Checkout) | `{ items, deliveryType, addressId... }` |
| `/api/orders` | `GET` | `protect` | Get logged-in user's order history| - |
| `/api/orders/:id` | `GET` | `protect` | Get specific order details | Params: `id` |
| `/api/orders/:id/cancel` | `PUT` | `protect` | Cancel a pending order | `{ cancelReason }` |

---

## 5. Payments (M-PESA Integration)
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/payments/stk-push` | `POST` | `protect` | Trigger M-PESA payment prompt | `{ orderId, phoneAmount }` |
| `/api/payments/callback` | `POST` | Public | Safaricom Daraja webhook listener | `Daraja Payload` |
| `/api/payments/status/:orderId`| `GET` | `protect` | Poll payment status for frontend UI| Params: `orderId` |

---

## 6. Admin Panel Operations
| Endpoint | Method | Auth Req | Description | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `/api/admin/stats` | `GET` | `adminOnly`| Get dashboard analytics (Sales, etc)| - |
| `/api/admin/orders` | `GET` | `adminOnly`| View all user orders | Query: `?status, ?page` |
| `/api/admin/orders/:id/status`| `PUT` | `adminOnly`| Update order status (e.g. Shipped)| `{ status }` |
| `/api/admin/users` | `GET` | `adminOnly`| View all registered users | - |
| `/api/admin/users/:id/role` | `PUT` | `adminOnly`| Change user role | `{ role }` |
| `/api/products` | `POST` | `adminOnly`| Create a new product | `Product Object` |
| `/api/products/:id` | `PUT`/`DELETE`| `adminOnly`| Manage existing product | Params: `id` |
| `/api/products/:id/images` | `POST` | `adminOnly`| Upload product images | `FormData (images)` |
| `/api/categories` | `POST`/`PUT`| `adminOnly`| Manage categories | `Category Object` |
| `/api/inventory/low-stock` | `GET` | `adminOnly`| Get items needing restock | - |
| `/api/inventory/:id/stock` | `PUT` | `adminOnly`| Update inventory count manually | `{ stock }` |
