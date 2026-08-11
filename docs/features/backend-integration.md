# Backend Integration

The Sneaky frontend talks to the Spring Boot backend through `src/services/*`. Protected calls use `apiRequest(..., { auth: true })`, which refreshes the access token when needed.

## Recommended Home Feed

The home feed loads products from:

```http
GET /api/products/recommended
```

The backend returns products already ranked by the recommendation service. The UI keeps rendering the normal `Product[]` shape, so recommendation logic stays on the backend.

Recommendations are personalized for logged-in users using wishlist, cart, recently viewed products, passed products, category, brand, price range, merchant affinity, global popularity, and diversity reranking.

Home dislike feedback is recorded for logged-in users through:

```http
POST /api/product-analytics/products/{productId}/pass
```

## Wishlist

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

## Cart And Merchant Checkout

Cart checkout is merchant-based instead of payment-based inside Sneaky. The cart groups items by `merchantName` and shows one outbound button per partner store.

Merchant checkout buttons do not call Sneaky payment APIs. They open the partner URL in a new tab.

## Notifications

Notifications are loaded for logged-in users from the backend and merged with local session notifications. The app refreshes server notifications on page focus and once per minute while the user is authenticated.

```http
GET /api/notifications
PATCH /api/notifications/read-all
DELETE /api/notifications
```

Server notifications come from backend cart reminders. Local notifications, such as immediate wishlist/cart feedback, remain stored in browser `localStorage`.

## Image Caching

Images are cached through `public/service-worker.js` with a cache-first strategy for image requests. After the service worker is registered and the page is reloaded once, repeated image URLs should come from browser cache or the service worker instead of a fresh network download.
