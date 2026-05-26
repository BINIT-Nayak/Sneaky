# Sneaky 🕵️‍♂️

A modern, sleek, and interactive application built to deliver a seamless user experience with performance, scalability, and clean architecture in mind.

---

## 📌 Overview

**Sneaky** is a project designed with a focus on modern UI/UX, optimized performance, and scalable architecture. Whether you're exploring frontend interactions, backend integrations, or full-stack implementations, Sneaky aims to provide a clean and maintainable development experience.

This repository showcases practical development patterns, reusable components, and efficient project structuring.

---

## ✨ Features

- ⚡ Fast and responsive interface
- 🎨 Clean and modern UI design
- 📱 Fully responsive across devices
- 🔒 Secure and scalable architecture
- 🧩 Reusable component structure
- 🏠 Swipe-style home product feed
- 🧠 Recommended product ordering from the backend
- 🏷️ Product category badges on home cards
- 🤝 Merchant partner links on product details and cart checkout groups
- ❤️ Wishlist management with single-item delete and clear-all support
- 🛒 Cart and wishlist API integration
- 🕘 Recently viewed product shortcuts
- 🖼️ Service worker image caching for repeat product and empty-state assets
- 🚀 Optimized performance
- 🔧 Easy configuration and customization

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 18
- 🟦 TypeScript
- 🔀 React Router DOM
- 🗂️ Redux Toolkit
- 🔄 React Redux
- 🎨 CSS / SCSS
- 🎯 React Icons

### Build & Development
- ⚡ Vite
- 📦 ES Modules
- 🔍 ESLint
- 🎨 Stylelint
- 🧹 TypeScript ESLint

### Testing
- 🧪 Jest
- 🧫 React Testing Library
- 👤 User Event Testing
- 🌐 JSDOM Environment
- 🔧 ts-jest

---

## 📂 Project Structure

```bash
Sneaky/
│
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/          # Reusable UI components
│   ├── pages/               # Application pages/routes
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Redux store & slices
│   ├── services/            # API services
│   ├── styles/              # Global styles & SCSS
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
│
├── tests/                   # Unit & integration tests
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .gitignore

```

## 🚀 Getting Started
Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- npm or yarn
- redux
- Git


▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## 🔌 Backend Integration

The home feed loads products from:

```http
GET /api/products/recommended
```

This endpoint returns products already ranked by the Spring Boot recommendation service. The UI keeps rendering the normal `Product[]` shape, so the recommendation logic stays on the backend.

Recommendations are personalized for logged-in users using wishlist, cart, recently viewed, passed products, category, brand, price range, merchant affinity, global popularity, and diversity reranking so the feed does not bunch similar products together.

Cart checkout is merchant-based instead of payment-based inside Sneaky. The cart groups items by `merchantName` and shows one outbound button per partner store.

Wishlist actions use authenticated API calls:

```http
GET /api/wishlist
POST /api/wishlist
POST /api/wishlist/{productId}/move-to-cart
DELETE /api/wishlist/{productId}
DELETE /api/wishlist
```

`DELETE /api/wishlist` clears all wishlist items for the logged-in user.

`POST /api/wishlist/{productId}/move-to-cart` moves an item into the cart in one backend transaction, so the UI does not need separate add-to-cart and delete-from-wishlist calls.

Images are cached through `public/service-worker.js` with a cache-first strategy for image requests. After the service worker is registered and the page is reloaded once, repeated image URLs should come from browser cache or the service worker instead of a fresh network download.

Home dislike feedback is recorded for logged-in users through:

```http
POST /api/product-analytics/products/{productId}/pass
```

## 📡 API Call Lifecycle

### Authentication

| API | Trigger | Condition |
| --- | --- | --- |
| `POST /api/auth/refresh` | App startup through `useAuth()` | Only when a saved user exists in `localStorage`. Also called automatically before protected requests when the access token is missing or expired. |
| `GET /api/users/me` | After refresh, login, or signup | Used to hydrate the current user profile after auth succeeds. |
| `POST /api/auth/login` | Login form submit | User enters email and password. |
| `POST /api/auth/register` | Signup form submit | User enters name, email, and password. |
| `POST /api/auth/logout` | Logout click | Runs after local auth/cart/wishlist state is cleared. |
| `PATCH /api/users/me` | Profile save | Only when the profile edit form passes validation. |

### Home

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/products/recommended` | Home page mount | Only when Redux has no products and products are not already loading. Navigating away and back to Home reuses the existing product list. |
| `POST /api/wishlist` | Right swipe or wishlist action | Only for logged-in users. The card advances immediately; this request runs in the background. |
| `POST /api/cart` | Add-to-cart action on Home/details modal | Only for logged-in users. The card advances immediately; this request runs in the background. |
| `POST /api/product-analytics/products/{productId}/pass` | Left swipe | Only for logged-in users. Preference recording runs in the background and does not block the next card. |

Home does not refetch recommendations after every swipe. Recommendation order refreshes on a future cold load or when the product list is intentionally cleared/refetched.

### Wishlist

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/wishlist` | Wishlist page mount | Only for logged-in users when `wishlistStatus === "idle"`. Once loaded, route switching reuses Redux wishlist state. |
| `POST /api/wishlist/{productId}/move-to-cart` | Wishlist item “Add to Cart” | Moves the product to cart and removes it from wishlist in one backend transaction. |
| `DELETE /api/wishlist/{productId}` | Wishlist item delete | Runs when the delete button is clicked. |
| `DELETE /api/wishlist` | Clear All | Runs when the wishlist clear-all button is clicked. |

### Cart

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/cart` | Cart page mount | Only for logged-in users when `cartStatus === "idle"`. Once loaded, route switching reuses Redux cart state. |
| `PATCH /api/cart/{productId}` | Quantity plus/minus | Runs when quantity remains at least `1`. |
| `DELETE /api/cart/{productId}` | Remove item or decrement below `1` | Runs when removing a cart item. |
| `DELETE /api/cart` | Clear Cart | Runs when the cart clear button is clicked. |

Merchant checkout buttons do not call Sneaky payment APIs. They open the partner URL in a new tab.

### Profile

| API | Trigger | Condition |
| --- | --- | --- |
| `GET /api/cart` | Profile page mount | Only for logged-in users when `cartStatus === "idle"`. |
| `GET /api/wishlist` | Profile page mount | Only for logged-in users when `wishlistStatus === "idle"`. |
| `PATCH /api/users/me` | Profile save | Only after name/email/password validation passes. |

### Admin

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

## 📸 Screenshots

Add project screenshots here.

## Roadmap
 - Improve animations
 - Optimize mobile responsiveness
 - Docker support
 - Track anonymous session preferences for guest recommendations

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
