# Frontend API Lifecycle

This document tracks when the Sneaky frontend calls backend APIs. The main README stays short; feature-level behavior lives here.

## Authentication

| API | Trigger | Condition |
| --- | --- | --- |
| `POST /api/auth/refresh` | App startup through `useAuth()` | Only when a saved user exists in `localStorage`. Also called automatically before protected requests when the access token is missing or expired. |
| `GET /api/users/me` | After refresh, login, or signup | Used to hydrate the current user profile after auth succeeds. |
| `POST /api/auth/login` | Login form submit | User enters email and password. |
| `POST /api/auth/register` | Signup form submit | User enters name, email, and password. |
| `POST /api/auth/logout` | Logout click | Runs after local auth/cart/wishlist state is cleared. |
| `PATCH /api/users/me` | Profile save | Only when the profile edit form passes validation. |

## Home

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/products/recommended` | Home page mount | Only when Redux has no products and products are not already loading. Navigating away and back to Home reuses the existing product list. |
| `POST /api/wishlist` | Right swipe or wishlist action | Only for logged-in users. The card advances immediately; this request runs in the background. |
| `POST /api/cart` | Add-to-cart action on Home/details modal | Only for logged-in users. The card advances immediately; this request runs in the background. |
| `POST /api/product-analytics/products/{productId}/pass` | Left swipe | Only for logged-in users. Preference recording runs in the background and does not block the next card. |

Home does not refetch recommendations after every swipe. Recommendation order refreshes on a future cold load or when the product list is intentionally cleared/refetched.

## Wishlist

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/wishlist` | Wishlist page mount | Only for logged-in users when `wishlistStatus === "idle"`. Once loaded, route switching reuses Redux wishlist state. |
| `POST /api/wishlist/{productId}/move-to-cart` | Wishlist item "Add to Cart" | Moves the product to cart and removes it from wishlist in one backend transaction. |
| `DELETE /api/wishlist/{productId}` | Wishlist item delete | Runs when the delete button is clicked. |
| `DELETE /api/wishlist` | Clear All | Runs when the wishlist clear-all button is clicked. |

## Cart

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/cart` | Cart page mount | Only for logged-in users when `cartStatus === "idle"`. Once loaded, route switching reuses Redux cart state. |
| `PATCH /api/cart/{productId}` | Quantity plus/minus | Runs when quantity remains at least `1`. |
| `DELETE /api/cart/{productId}` | Remove item or decrement below `1` | Runs when removing a cart item. |
| `DELETE /api/cart` | Clear Cart | Runs when the cart clear button is clicked. |

Merchant checkout buttons do not call Sneaky payment APIs. They open the partner URL in a new tab.

## Notifications

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/notifications` | App notification provider refresh | Only for logged-in users. Runs on login, browser focus, and every 60 seconds while authenticated. |
| `PATCH /api/notifications/read-all` | Notifications page mount | Runs when the notifications page opens and notifications are marked read locally. |
| `DELETE /api/notifications` | Clear notifications | Runs when the notifications clear button is clicked. |

Server notifications come from backend cart reminders. Local notifications, such as immediate wishlist/cart feedback, remain stored in browser `localStorage`.

## Profile

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/cart` | Profile page mount | Only for logged-in users when `cartStatus === "idle"`. |
| `GET /api/wishlist` | Profile page mount | Only for logged-in users when `wishlistStatus === "idle"`. |
| `PATCH /api/users/me` | Profile save | Only after name/email/password validation passes. |

## Admin

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/admin/dashboard/stats` | Admin page mount and refresh | Only for admin users. |
| `GET /api/admin/users?size=50` | Admin page mount and refresh | Only for admin users. |
| `GET /api/brands` | Admin page mount and refresh | Used to populate brand selectors/list. |
| `GET /api/admin/products?size=50&status={status}` | Admin page mount and product status filter change | Reloads products for the selected status. |
| `POST /api/admin/products` | Create product | Product form submit while not editing. |
| `PATCH /api/admin/products/{productId}` | Update product | Product form submit while editing. |
| `PUT /api/admin/products/{productId}/approve` | Approve product | Admin approve action. |
| `PUT /api/admin/products/{productId}/reject` | Reject product | Admin reject action. |
| `DELETE /api/admin/products/{productId}` | Deactivate product | Admin deactivate action. |
| `PUT /api/admin/users/{userId}/role` | Change user role | Admin role selector change. |
| `PUT /api/admin/users/{userId}/ban` | Ban/unban user | Admin ban action. |
| `POST /api/admin/brands` | Create brand | Brand form submit while not editing. |
| `PUT /api/admin/brands/{brandId}` | Update brand | Brand form submit while editing. |
| `DELETE /api/admin/brands/{brandId}` | Delete brand | Admin brand delete action. |
