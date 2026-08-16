# Sneaky HLD and LLD Diagrams

## High-Level Design

```mermaid
flowchart TD
    user[User Browser]
    frontend[React Frontend<br/>Vite + TypeScript + Redux]
    backend[Spring Boot Backend<br/>REST API + Business Logic]
    postgres[(PostgreSQL<br/>Users, Products, Cart, Wishlist, Notifications)]
    redis[(Redis<br/>Recommendation Cache, Analytics, Recent Views)]
    kafka[Kafka<br/>Optional User Activity Events]
    recommender[FastAPI ML Recommender<br/>Optional Candidate Reranking]
    email[Email Service<br/>Optional Cart Reminders]

    user --> frontend
    frontend -->|HTTP /api/*| backend
    backend --> postgres
    backend --> redis
    backend -->|optional publish| kafka
    kafka -->|consume events| backend
    backend -->|optional /rank| recommender
    backend -->|optional SMTP| email
```

## Runtime Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL
    participant R as Redis
    participant ML as ML Recommender

    U->>FE: Open Sneaky
    FE->>API: POST /api/auth/refresh
    API-->>FE: Access token or unauthenticated state

    FE->>API: GET /api/products/recommended
    API->>R: Check recommendation cache

    alt Cache hit
        R-->>API: Ranked product IDs
        API->>DB: Fetch products by IDs
    else Cache miss
        API->>DB: Load active approved products
        API->>DB: Load wishlist/cart signals
        API->>R: Load recent views, passed products, popularity
        opt ML enabled and user has enough signals
            API->>ML: POST /rank with candidate features
            ML-->>API: Ranked scores
        end
        API->>R: Cache final ranked IDs
    end

    API-->>FE: ProductDTO[]
    FE-->>U: Render swipe feed
```

## Frontend Low-Level Design

```mermaid
flowchart TD
    main[main.tsx]
    app[App.tsx]
    router[React Router]
    authContext[AuthContext]
    notificationContext[NotificationsProvider]
    pages[Pages<br/>Home, Cart, Wishlist, Profile, Admin]
    components[Reusable Components<br/>Button, NavBar, Toast, SwipeButton]
    hooks[Hooks<br/>useAuth, useHomeActions]
    thunks[Redux Async Thunks<br/>fetchProducts, addCartItem, addWishlistItem]
    slice[sneakySlice<br/>products, cart, wishlist, auth UI state]
    services[API Services<br/>authAPI, productsAPI, cartAPI, wishlistAPI]
    api[apiRequest<br/>token refresh + error handling]
    backend[Spring Backend]

    main --> app
    app --> authContext
    app --> notificationContext
    app --> router
    router --> pages
    pages --> components
    pages --> hooks
    hooks --> thunks
    pages --> thunks
    thunks --> slice
    thunks --> services
    services --> api
    api --> backend
```

## Backend Low-Level Design

```mermaid
flowchart TD
    request[HTTP Request]
    security[Security Filters<br/>JwtFilter + RateLimitFilter]
    controllers[Controllers<br/>Auth, Product, Cart, Wishlist, Admin]
    dtos[DTOs<br/>Request/Response Contracts]
    services[Services<br/>Business Logic + Transactions]
    repositories[Repositories<br/>Spring Data JPA]
    entities[Entities<br/>Users, Products, Cart, WishList, Brands]
    db[(PostgreSQL)]
    redis[(Redis)]
    analytics[Analytics Publisher<br/>Kafka or NoOp]
    mlClient[MlRankingClient]
    ml[FastAPI ML Service]

    request --> security
    security --> controllers
    controllers --> dtos
    controllers --> services
    services --> repositories
    repositories --> entities
    entities --> db
    services --> redis
    services --> analytics
    services --> mlClient
    mlClient --> ml
```

## Recommendation LLD

```mermaid
flowchart TD
    start[GET /api/products/recommended]
    cacheCheck{excludeIds empty?}
    redisCache[Read Redis Cache<br/>recommendations:guest or recommendations:user:id]
    cacheHit{Cache hit?}
    activeProducts[Load Active Approved Products]
    userCheck{Logged in user?}
    guestRank[Guest Ranking<br/>popularity + newest]
    signals[Load User Signals<br/>wishlist, cart, recent views, passes]
    enoughSignals{At least 20 signals?}
    score[Rule-Based Scoring<br/>brand, category, merchant, price, penalties]
    candidates[Top 250 Candidates]
    mlEnabled{ML enabled?}
    mlRank[Call FastAPI /rank]
    diversify[Diversity Reranking<br/>avoid repeated category/brand/merchant]
    limit[Limit to 30 Products]
    cacheWrite[Write Redis Cache<br/>15 min TTL]
    response["Return ProductDTO[]"]

    start --> cacheCheck
    cacheCheck -->|yes| redisCache
    cacheCheck -->|no| activeProducts
    redisCache --> cacheHit
    cacheHit -->|yes| response
    cacheHit -->|no| activeProducts
    activeProducts --> userCheck
    userCheck -->|no| guestRank
    userCheck -->|yes| signals
    signals --> enoughSignals
    enoughSignals -->|no| guestRank
    enoughSignals -->|yes| score
    score --> candidates
    candidates --> mlEnabled
    mlEnabled -->|yes| mlRank
    mlEnabled -->|no| diversify
    mlRank --> diversify
    guestRank --> diversify
    diversify --> limit
    limit --> cacheWrite
    cacheWrite --> response
```

## Authentication LLD

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as AuthController
    participant S as AuthService
    participant DB as UsersRepository
    participant JWT as JwtUtil

    FE->>API: POST /api/auth/login
    API->>S: authenticate(email, password)
    S->>DB: find user by email
    DB-->>S: Users entity
    S->>S: verify password and banned state
    S->>JWT: generate access + refresh token
    JWT-->>S: AuthTokensDTO
    S-->>API: LoginResponseDTO
    API-->>FE: accessToken + HTTP-only refresh cookie

    FE->>API: Protected request with Bearer token
    API-->>FE: Response

    FE->>API: POST /api/auth/refresh
    API->>S: refresh(cookie refresh token)
    S->>JWT: validate refresh token
    JWT-->>S: new access token
    S-->>API: RefreshResponseDTO
    API-->>FE: accessToken
```

## Cart and Wishlist LLD

```mermaid
flowchart TD
    home[Home Swipe Action]
    like[Right Swipe / Wishlist]
    cart[Add To Cart]
    pass[Left Swipe / Pass]

    wishlistApi[POST /api/wishlist]
    cartApi[POST /api/cart]
    passApi[POST /api/product-analytics/products/id/pass]

    wishlistService[WishlistService]
    cartService[CartService]
    productService[ProductService]

    userRepo[UsersRepository]
    productRepo[ProductsRepository]
    wishlistRepo[WishListRepository]
    cartRepo[CartRepository]
    analytics[ActivityEventPublisher]
    redis[(Redis Analytics)]
    db[(PostgreSQL)]

    home --> like
    home --> cart
    home --> pass

    like --> wishlistApi --> wishlistService
    cart --> cartApi --> cartService
    pass --> passApi --> productService

    wishlistService --> userRepo
    wishlistService --> productRepo
    wishlistService --> wishlistRepo

    cartService --> userRepo
    cartService --> productRepo
    cartService --> cartRepo

    productService --> productRepo

    wishlistRepo --> db
    cartRepo --> db
    userRepo --> db
    productRepo --> db

    wishlistService --> analytics
    cartService --> analytics
    productService --> analytics
    analytics --> redis
```

## Admin LLD

```mermaid
flowchart TD
    adminUser[Admin User]
    adminPage[React Admin Page]
    adminApi[adminAPI.ts]
    security[Spring Security<br/>hasRole ADMIN]
    adminController[AdminController]
    productService[ProductService]
    brandService[BrandService]
    userService[UserService]
    repos[Repositories<br/>Users, Products, Brands, Swipes]
    db[(PostgreSQL)]

    adminUser --> adminPage
    adminPage --> adminApi
    adminApi --> security
    security --> adminController
    adminController --> productService
    adminController --> brandService
    adminController --> userService
    adminController --> repos
    productService --> repos
    brandService --> repos
    userService --> repos
    repos --> db
```
