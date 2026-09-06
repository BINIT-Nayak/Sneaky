# Sneaky Performance And Bundle Report

This page summarizes the frontend performance work done to reduce render delay, critical-path requests, bundle weight, and reload-time LCP issues.

## Current Production Build Snapshot

```txt
dist        628K
dist/assets 620K
```

| Area | Current Result |
| --- | ---: |
| Main JS bundle | 225.46 kB |
| Main JS gzip | 73.97 kB |
| Largest route chunk | Home: 19.50 kB |
| Cart route chunk | 13.23 kB |
| Wishlist route chunk | 8.91 kB |
| Profile route chunk | 8.90 kB |

## Route Chunking

```mermaid
flowchart LR
    Browser[Initial page load]
    Main[index JS<br/>225.46 kB]
    Home[Home<br/>19.50 kB]
    Cart[Cart<br/>13.23 kB]
    Wishlist[Wishlist<br/>8.91 kB]
    Profile[Profile<br/>8.90 kB]
    Admin[Admin<br/>13.17 kB]
    Auth[AuthModal<br/>3.49 kB]

    Browser --> Main
    Main -. load only when route opens .-> Home
    Main -. load only when route opens .-> Cart
    Main -. load only when route opens .-> Wishlist
    Main -. load only when route opens .-> Profile
    Main -. load only when route opens .-> Admin
    Main -. load only when login modal opens .-> Auth
```

| Chunk | Size | Gzip |
| --- | ---: | ---: |
| index | 225.46 kB | 73.97 kB |
| Home | 19.50 kB | 6.22 kB |
| Cart | 13.23 kB | 3.95 kB |
| Wishlist | 8.91 kB | 2.82 kB |
| Profile | 8.90 kB | 2.77 kB |
| Admin | 13.17 kB | 3.76 kB |
| AuthModal | 3.49 kB | 1.30 kB |
| Notifications | 2.48 kB | 0.98 kB |

## Dependency Weight Reduction

```mermaid
flowchart LR
    Before[Before<br/>react-icons package]
    After[After<br/>local icon components]
    Bundle[Smaller dependency graph]

    Before --> After --> Bundle
```

`react-icons` was removed and replaced with local lightweight icon components.

Verification:

```txt
npm ls react-icons
└── (empty)
```

## Font Critical Path

```mermaid
flowchart TD
    Old[Old path<br/>Browser requests Google Fonts CSS]
    Block[Render-blocking request<br/>around 800-1200 ms]
    New[New path<br/>Local WOFF2 fonts]
    Paint[Faster first paint path]

    Old --> Block
    Block --> New
    New --> Paint
```

| Font Asset | Built Size |
| --- | ---: |
| Space Grotesk variable WOFF2 | 48.87 kB |
| Imperial Script WOFF2 | 58.08 kB |

Impact:

| Before | After |
| --- | --- |
| Google Fonts CSS request on critical path | Local font files emitted by Vite |
| Lighthouse showed render-blocking font request | Font request no longer depends on Google Fonts |

## Static Asset Optimization

```mermaid
flowchart LR
    PNGJPG[Original static assets]
    Optimized[AVIF / WebP assets]
    Smaller[Lower transfer size]

    PNGJPG --> Optimized --> Smaller
```

| Asset | Format | Built Size |
| --- | --- | ---: |
| bell | AVIF | 22.42 kB |
| emptyList | AVIF | 23.20 kB |
| favicon | WebP | 8.59 kB |

Product images also use optimized image URLs with constrained widths, quality parameters, `srcSet`, fixed dimensions, and priority on the first visible item.

## Cache-First Page Rendering

Cart, Wishlist, and Profile now prefer fast local paint first, then refresh in the background.

```mermaid
flowchart TD
    Reload[Page reload]
    Cache{Local cache exists?}
    Paint[Paint cached UI immediately]
    Skeleton[Show skeleton]
    Idle[Wait for idle time<br/>or short fallback delay]
    API[Refresh API request]
    Store[Update Redux store]
    CacheWrite[Update local cache]

    Reload --> Cache
    Cache -- yes --> Paint --> Idle --> API --> Store --> CacheWrite
    Cache -- no --> Skeleton --> API --> Store --> CacheWrite
```

### Wishlist LCP Fix

Lighthouse input:

| Subpart | Duration |
| --- | ---: |
| Time to first byte | 360 ms |
| Element render delay | 5,960 ms |

Root cause:

```mermaid
flowchart LR
    Cache[Cached wishlist hydrated]
    Refresh[Immediate forced refresh]
    Loading[Loading skeleton shown again]
    Delay[Wishlist grid rendered late]

    Cache --> Refresh --> Loading --> Delay
```

Fix:

```mermaid
flowchart LR
    Cache[Cached wishlist hydrated]
    Grid[Wishlist grid paints immediately]
    Idle[Background refresh after idle]
    Updated[Fresh data replaces cache]

    Cache --> Grid --> Idle --> Updated
```

### Cart LCP Fix

Lighthouse input:

| Subpart | Duration |
| --- | ---: |
| Time to first byte | 400 ms |
| Resource load delay | 4,610 ms |
| Resource load duration | 20 ms |
| Element render delay | 30 ms |

Root cause:

```mermaid
flowchart LR
    Reload[Cart reload]
    Refresh[Immediate cart refresh]
    LateDOM[First cart image enters DOM late]
    Request[Image request starts late]

    Reload --> Refresh --> LateDOM --> Request
```

Fix:

```mermaid
flowchart LR
    Reload[Cart reload]
    Cache[Cached cart renders]
    Image[First cart image enters DOM early]
    Priority[fetchpriority=high]
    Refresh[Idle background refresh]

    Reload --> Cache --> Image --> Priority
    Cache --> Refresh
```

## API Critical Path Reduction

```mermaid
flowchart TD
    Initial[Initial route render]
    UI[Paint useful UI]
    NonCritical[Non-critical work]
    Notifications[Notifications API]
    Events[Impression event API]
    Profile[Profile summary refresh]

    Initial --> UI
    UI --> NonCritical
    NonCritical --> Notifications
    NonCritical --> Events
    NonCritical --> Profile
```

Changes:

| Area | Optimization |
| --- | --- |
| Notifications | Initial fetch delayed so it does not block Home LCP |
| Event tracking | Passive impression tracking deferred with idle callback |
| Profile summary | Hydrate from local cache first, then refresh later |
| Cart | Hydrate cached cart first, refresh later |
| Wishlist | Hydrate cached wishlist first, refresh later |

## Verification

```txt
npm run build
```

Passed.

```txt
npm test -- --runTestsByPath src/pages/Cart/Cart.test.tsx --watchAll=false --watchman=false
```

Passed: 6 tests.

```txt
npm test -- --runTestsByPath src/pages/WishList/Wishlist.test.tsx --watchAll=false --watchman=false
```

Passed: 4 tests.

## Summary

```mermaid
flowchart LR
    A[Removed heavy icon dependency]
    B[Lazy loaded routes]
    C[Localized fonts]
    D[Optimized static assets]
    E[Deferred non-critical APIs]
    F[Cache-first reload rendering]
    G[Better LCP path]

    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
```

The main improvement is that expensive or non-critical work now happens after the first useful paint, while route chunks, icons, fonts, images, Cart, Wishlist, and Profile are lighter or faster to show on reload.
