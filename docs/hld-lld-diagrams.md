# Sneaky HLD and LLD Diagrams

## Current Runtime Components

- Kafka topic: `sneaky.user-activity`
- Kafka consumer group: `sneaky-analytics`
- Event API: `POST /api/events`, returns `202 Accepted`
- Event types: `IMPRESSION`, `VIEW`, `CLICK`, `SKIP`, `WISHLIST`, `CART`, `PURCHASE`
- Redis recommendation keys: `recommendations:guest`, `recommendations:user:{userId}`, `recommendations:user:{userId}:personalized`
- Recommendation cache TTL: 15 minutes
- Preference tables: `user_preferences`, `user_brand_preferences`, `user_category_preferences`

## High-Level Design

```mermaid
flowchart TD
    user[User Browser]
    frontend[React Frontend<br/>Vite + TypeScript + Redux]
    backend[Spring Boot Backend<br/>REST APIs + Business Logic]
    postgres[(PostgreSQL<br/>Users, Products, Cart, Wishlist, Preferences)]
    redis[(Redis or Upstash<br/>Recommendation Cache, Analytics, Recent Views)]
    kafka[Kafka Topic<br/>sneaky.user-activity]
    consumer[UserActivityEventConsumer<br/>Async Profile and Analytics Updates]
    recommender[FastAPI ML Recommender<br/>Optional Candidate Reranking]
    email[Email Service<br/>Optional Cart Reminders]

    user --> frontend
    frontend -->|HTTP /api/*| backend
    backend --> postgres
    backend --> redis
    backend -->|publish user events| kafka
    kafka --> consumer
    consumer --> postgres
    consumer --> redis
    consumer --> backend
    backend -->|optional /rank| recommender
    backend -->|optional SMTP| email
```

## Runtime Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React Frontend
    participant API as Spring Boot API
    participant C as Recommendation Cache
    participant DB as PostgreSQL
    participant R as Redis
    participant ML as ML Recommender

    U->>FE: Open Sneaky
    FE->>API: POST /api/auth/refresh
    API-->>FE: Access token or unauthenticated state

    FE->>API: GET /api/products/recommended
    API->>C: get user or guest cache
    C->>R: GET recommendations:user:id

    alt Cache hit
        R-->>C: Ranked product IDs
        C-->>API: Cached product IDs
        API->>DB: Fetch products by IDs
    else Cache miss
        C-->>API: Empty
        API->>DB: Load active approved products
        API->>DB: Load user preference profile
        API->>R: Load recent views, passed products, popularity
        opt ML enabled and user has enough signals
            API->>ML: POST /rank with candidate features
            ML-->>API: Ranked scores
        end
        API->>C: put ranked IDs with 15 minute TTL
        C->>R: SET recommendations:user:id
    end

    API-->>FE: ProductDTO list
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
    services[API Services<br/>authAPI, productsAPI, cartAPI, wishlistAPI, eventAPI]
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
    hooks --> services
    services --> api
    api --> backend
```

## Backend Low-Level Design

```mermaid
flowchart TD
    request[HTTP Request]
    security[Security Filters<br/>JwtFilter + RateLimitFilter]
    controllers[Controllers<br/>Auth, Product, Cart, Wishlist, Admin, UserEvent]
    dtos[DTOs<br/>Request/Response Contracts]
    services[Services<br/>Business Logic + Transactions]
    repositories[Repositories<br/>Spring Data JPA]
    entities[Entities<br/>Users, Products, Cart, WishList, Brands, UserPreferences]
    db[(PostgreSQL)]
    redis[(Redis)]
    publisher[ActivityEventPublisher<br/>KafkaActivityEventPublisher or NoOp]
    kafka[Kafka<br/>sneaky.user-activity]
    consumer[UserActivityEventConsumer]
    profile[UserPreferenceProfileService]
    recCache[ProductRecommendationCache]
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
    services --> publisher
    publisher --> kafka
    kafka --> consumer
    consumer --> profile
    profile --> repositories
    consumer --> recCache
    recCache --> redis
    services --> mlClient
    mlClient --> ml
```

## Event Tracking LLD

```mermaid
sequenceDiagram
    participant FE as React Frontend
    participant API as UserEventController
    participant S as UserEventTrackingService
    participant P as ActivityEventPublisher
    participant K as Kafka sneaky.user-activity
    participant C as UserActivityEventConsumer
    participant PF as UserPreferenceProfileService
    participant DB as PostgreSQL
    participant R as Redis
    participant RC as ProductRecommendationCache

    FE->>API: POST /api/events
    API->>S: track current user event
    S->>P: publish UserActivityEventDTO
    P->>K: send event
    API-->>FE: 202 Accepted

    K-->>C: consume event
    C->>PF: applyEvent
    PF->>DB: update user_preferences
    PF->>DB: update brand and category scores
    C->>R: record analytics and recent signals
    C->>RC: invalidate user feed cache
    RC->>R: DEL recommendations:user:id
```

## Preference Profile LLD

```mermaid
flowchart TD
    event[UserActivityEventDTO]
    type[UserEventType<br/>IMPRESSION, VIEW, CLICK, SKIP, WISHLIST, CART, PURCHASE]
    weights[EventWeights<br/>0, 0.5, 1, -1, 3, 4, 5]
    product[ProductsRepository<br/>load product brand, category, price]
    profile[UserPreferences<br/>price range and behavior counters]
    brandPref[UserBrandPreference<br/>brand score and count]
    categoryPref[UserCategoryPreference<br/>category score and count]
    decay[PreferenceDecay<br/>age based score decay]
    normalize[Clamp score<br/>minimum -1 maximum 1]
    db[(PostgreSQL)]
    cache[ProductRecommendationCache]
    redis[(Redis)]

    event --> type
    type --> weights
    event --> product
    product --> profile
    product --> brandPref
    product --> categoryPref
    brandPref --> decay
    categoryPref --> decay
    weights --> normalize
    decay --> normalize
    normalize --> brandPref
    normalize --> categoryPref
    profile --> db
    brandPref --> db
    categoryPref --> db
    event --> cache
    cache --> redis
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
    profile[Load UserPreferenceProfile<br/>brand, category, price, behavior stats]
    signals[Load Exact Signals<br/>wishlist, cart, recent views, passes]
    hasProfile{Useful profile or signals?}
    score[Rule-Based Scoring<br/>preference scores, price fit, penalties]
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
    userCheck -->|yes| profile
    profile --> signals
    signals --> hasProfile
    hasProfile -->|no| guestRank
    hasProfile -->|yes| score
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

## Cache Invalidation LLD

```mermaid
flowchart TD
    action[Wishlist, Cart, Purchase, Skip, View]
    eventApi[POST /api/events or domain API]
    publisher[ActivityEventPublisher]
    topic[Kafka Topic<br/>sneaky.user-activity]
    consumer[UserActivityEventConsumer]
    profile[Update Preference Profile]
    analytics[Record Analytics Signals]
    invalidate[Delete Recommendation Cache]
    key1[recommendations:user:id]
    key2[recommendations:user:id:personalized]
    nextFeed[Next GET /api/products/recommended]
    miss[Redis miss]
    regenerate[Generate updated recommendations]
    write[Cache new ranked IDs]

    action --> eventApi
    eventApi --> publisher
    publisher --> topic
    topic --> consumer
    consumer --> profile
    consumer --> analytics
    consumer --> invalidate
    invalidate --> key1
    invalidate --> key2
    key1 --> nextFeed
    key2 --> nextFeed
    nextFeed --> miss
    miss --> regenerate
    regenerate --> write
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
    eventApi[POST /api/events]

    wishlistService[WishlistService]
    cartService[CartService]
    eventService[UserEventTrackingService]

    userRepo[UsersRepository]
    productRepo[ProductsRepository]
    wishlistRepo[WishListRepository]
    cartRepo[CartRepository]
    analytics[ActivityEventPublisher]
    kafka[Kafka<br/>sneaky.user-activity]
    consumer[UserActivityEventConsumer]
    redis[(Redis Analytics and Recommendation Cache)]
    db[(PostgreSQL)]

    home --> like
    home --> cart
    home --> pass

    like --> wishlistApi --> wishlistService
    cart --> cartApi --> cartService
    pass --> eventApi --> eventService

    wishlistService --> userRepo
    wishlistService --> productRepo
    wishlistService --> wishlistRepo

    cartService --> userRepo
    cartService --> productRepo
    cartService --> cartRepo

    eventService --> productRepo

    wishlistRepo --> db
    cartRepo --> db
    userRepo --> db
    productRepo --> db

    wishlistService --> analytics
    cartService --> analytics
    eventService --> analytics
    analytics --> kafka
    kafka --> consumer
    consumer --> redis
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
    repos[Repositories<br/>Users, Products, Brands]
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
