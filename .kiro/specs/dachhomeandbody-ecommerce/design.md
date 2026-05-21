# Design Document: Dachhomeandbody E-Commerce Platform

## Overview

The DACH Home & Body e-commerce platform is a luxury home fragrance, natural skincare, and gift services shopping experience built with Next.js 14+ (App Router), TypeScript, and modern web technologies. The architecture follows a full-stack Next.js approach with server-side rendering, server actions, and API routes, backed by PostgreSQL with Prisma ORM.

**Business:** DACH Home & Body — owned by Adacha B. Dzarma  
**Location:** Abuja, FCT, Nigeria  
**Contact:** 07064313141 | adachadzarma@gmail.com  
**Products & Services:** Home Fragrance, Natural Skincare, Gift Services  
**Target Audience:** Luxury & wellness lifestyle shoppers, Gift Buyers  
**Brand Colors:** Primary — Black; Secondary — Gold, Grey & White  
**Brand Style:** Minimalist Luxury  
**Desired Customer Feeling:** Personal, Elegant, Memorable  
**Delivery:** Abuja — Same day (except custom orders); Nationwide — 3–5 business days

The design emphasizes:
- **Luxury aesthetics**: Cinematic, minimal, spacious design inspired by premium fragrance brands
- **Mobile-first**: Responsive design optimized for mobile devices with progressive enhancement
- **Performance**: Fast page loads, optimized images, efficient data fetching
- **Type safety**: End-to-end TypeScript for reliability
- **Security**: Secure authentication, payment processing, and data handling

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Next.js App Router, React Components, Framer Motion)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Server       │  │ API Routes   │  │ Middleware   │     │
│  │ Actions      │  │              │  │ (Auth)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth     │  │ Payment  │  │ Email    │  │ Storage  │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Prisma ORM       │  │ PostgreSQL DB    │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  Cloudinary │ Paystack │ Flutterwave │ Resend │ Auth.js    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

- **Next.js 14+ App Router**: Server components, streaming, and optimized routing for performance
- **TypeScript**: Type safety reduces runtime errors and improves developer experience
- **Prisma ORM**: Type-safe database access with excellent TypeScript integration
- **PostgreSQL**: Robust relational database for complex e-commerce data relationships
- **Auth.js**: Flexible authentication with multiple providers
- **Cloudinary**: Optimized image delivery with automatic format conversion and responsive images
- **Paystack/Flutterwave**: African payment gateway integration for local market
- **Resend**: Modern email API with excellent deliverability
- **TailwindCSS**: Utility-first CSS for rapid, consistent styling
- **Framer Motion**: Smooth animations for premium feel

## Components and Interfaces

### Core Domain Models

#### Product Model
```typescript
interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: Category
  categoryId: string
  stock: number
  sku: string
  featured: boolean
  
  // Fragrance-specific fields
  fragranceType?: FragranceType
  topNotes?: string[]
  heartNotes?: string[]
  baseNotes?: string[]
  longevity?: Longevity
  strength?: Strength
  moodTags?: string[]
  gender?: Gender
  
  reviews: Review[]
  averageRating?: number
  reviewCount: number
  
  createdAt: Date
  updatedAt: Date
}

enum FragranceType {
  PERFUME = "PERFUME"
  EAU_DE_PARFUM = "EAU_DE_PARFUM"
  EAU_DE_TOILETTE = "EAU_DE_TOILETTE"
  COLOGNE = "COLOGNE"
  BODY_MIST = "BODY_MIST"
}

enum Longevity {
  SHORT = "SHORT"        // 1-3 hours
  MODERATE = "MODERATE"  // 3-6 hours
  LONG = "LONG"          // 6-12 hours
  VERY_LONG = "VERY_LONG" // 12+ hours
}

enum Strength {
  LIGHT = "LIGHT"
  MODERATE = "MODERATE"
  STRONG = "STRONG"
  VERY_STRONG = "VERY_STRONG"
}

enum Gender {
  UNISEX = "UNISEX"
  MALE = "MALE"
  FEMALE = "FEMALE"
}
```

#### User Model
```typescript
interface User {
  id: string
  email: string
  name?: string
  phone?: string
  password?: string // hashed, optional for OAuth users
  role: UserRole
  emailVerified?: Date
  image?: string
  
  orders: Order[]
  reviews: Review[]
  wishlist: WishlistItem[]
  addresses: Address[]
  
  createdAt: Date
  updatedAt: Date
}

enum UserRole {
  CUSTOMER = "CUSTOMER"
  ADMIN = "ADMIN"
}
```

#### Order Model
```typescript
interface Order {
  id: string
  orderNumber: string
  user?: User
  userId?: string
  
  // Guest checkout support
  guestEmail?: string
  guestName?: string
  
  items: OrderItem[]
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  paymentReference?: string
  
  shippingAddress: Address
  
  couponCode?: string
  couponId?: string
  
  notes?: string
  
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
}

enum OrderStatus {
  PENDING = "PENDING"
  PROCESSING = "PROCESSING"
  SHIPPED = "SHIPPED"
  DELIVERED = "DELIVERED"
  CANCELLED = "CANCELLED"
  REFUNDED = "REFUNDED"
}

enum PaymentStatus {
  PENDING = "PENDING"
  PAID = "PAID"
  FAILED = "FAILED"
  REFUNDED = "REFUNDED"
}

interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number // Price at time of purchase
  subtotal: number
}
```

#### Cart Model (Client-side)
```typescript
interface CartItem {
  productId: string
  product: Product
  quantity: number
}

interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  couponCode?: string
}
```

#### Review Model
```typescript
interface Review {
  id: string
  productId: string
  product: Product
  userId: string
  user: User
  rating: number // 1-5
  title?: string
  comment: string
  verifiedPurchase: boolean
  status: ReviewStatus
  createdAt: Date
  updatedAt: Date
}

enum ReviewStatus {
  PENDING = "PENDING"
  APPROVED = "APPROVED"
  REJECTED = "REJECTED"
}
```

#### Coupon Model
```typescript
interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderValue?: number
  maxUsageCount?: number
  usageCount: number
  expiresAt?: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

enum DiscountType {
  PERCENTAGE = "PERCENTAGE"
  FIXED = "FIXED"
}
```

### Component Architecture

#### Page Components (App Router)

**Customer-Facing Routes:**
- `/` - Homepage with hero, featured collections, best sellers
- `/shop` - Product listing with filters and search
- `/shop/[slug]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/account` - Customer dashboard (protected)
- `/account/orders` - Order history
- `/account/orders/[id]` - Order details
- `/account/wishlist` - Saved products
- `/account/profile` - Profile settings
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/reset-password` - Password reset

**Admin Routes:**
- `/admin` - Admin dashboard with analytics
- `/admin/products` - Product management
- `/admin/products/new` - Create product
- `/admin/products/[id]/edit` - Edit product
- `/admin/orders` - Order management
- `/admin/orders/[id]` - Order details
- `/admin/customers` - Customer management
- `/admin/coupons` - Coupon management
- `/admin/reviews` - Review moderation
- `/admin/categories` - Category management

#### Reusable Components

**Product Components:**
- `ProductCard` - Grid item with image, name, price, quick actions
- `ProductGrid` - Responsive grid layout with loading states
- `ProductGallery` - Image carousel with zoom
- `ProductInfo` - Details, fragrance notes, add to cart
- `FragranceProfile` - Visual display of notes, longevity, strength
- `ProductFilters` - Filter sidebar/drawer
- `ProductSort` - Sort dropdown

**Cart Components:**
- `CartDrawer` - Slide-out cart overlay
- `CartItem` - Individual cart item with quantity controls
- `CartSummary` - Subtotal, discount, total display
- `CouponInput` - Coupon code entry and validation

**Checkout Components:**
- `CheckoutForm` - Multi-step checkout flow
- `ShippingAddressForm` - Address input with validation
- `PaymentMethodSelector` - Payment option selection
- `OrderSummary` - Final order review

**UI Components:**
- `Button` - Primary, secondary, ghost variants
- `Input` - Text, email, password inputs with validation
- `Select` - Dropdown selector
- `Modal` - Dialog overlay
- `Toast` - Notification system
- `Loader` - Loading spinner/skeleton
- `Badge` - Status indicators
- `Rating` - Star rating display and input

### API Design

#### Server Actions (for mutations)

```typescript
// Product actions
async function createProduct(data: ProductInput): Promise<Product>
async function updateProduct(id: string, data: ProductInput): Promise<Product>
async function deleteProduct(id: string): Promise<void>

// Order actions
async function createOrder(data: OrderInput): Promise<Order>
async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order>

// Review actions
async function createReview(data: ReviewInput): Promise<Review>
async function approveReview(id: string): Promise<Review>
async function rejectReview(id: string): Promise<Review>

// Coupon actions
async function applyCoupon(code: string, cartTotal: number): Promise<CouponResult>
async function createCoupon(data: CouponInput): Promise<Coupon>

// Auth actions
async function registerUser(data: RegisterInput): Promise<User>
async function updateProfile(data: ProfileInput): Promise<User>
```

#### API Routes (for external integrations)

```typescript
// Payment webhooks
POST /api/webhooks/paystack
POST /api/webhooks/flutterwave

// Image upload
POST /api/upload

// Search
GET /api/search?q={query}

// Analytics (admin)
GET /api/admin/analytics?startDate={date}&endDate={date}
```

## Data Models

### Database Schema (Prisma)

The database schema follows the provided Prisma schema with these key relationships:

**User → Orders**: One-to-many (a user can have multiple orders)
**User → Reviews**: One-to-many (a user can write multiple reviews)
**User → Wishlist**: One-to-many (a user can have multiple wishlist items)
**User → Addresses**: One-to-many (a user can have multiple saved addresses)

**Product → Category**: Many-to-one (products belong to one category)
**Product → Reviews**: One-to-many (a product can have multiple reviews)
**Product → OrderItems**: One-to-many (a product can appear in multiple orders)

**Order → OrderItems**: One-to-many (an order contains multiple items)
**Order → User**: Many-to-one (orders belong to a user, optional for guest checkout)
**Order → Coupon**: Many-to-one (orders can use a coupon)

**Category → Products**: One-to-many (a category contains multiple products)

### Data Access Patterns

#### Product Queries
```typescript
// Get products with filters
interface ProductFilters {
  categoryId?: string
  priceMin?: number
  priceMax?: number
  fragranceType?: FragranceType[]
  longevity?: Longevity[]
  strength?: Strength[]
  gender?: Gender[]
  inStock?: boolean
  search?: string
}

async function getProducts(
  filters: ProductFilters,
  sort: ProductSort,
  pagination: Pagination
): Promise<PaginatedProducts>

// Get single product with relations
async function getProduct(slug: string): Promise<Product & {
  category: Category
  reviews: Review[]
}>

// Get featured products
async function getFeaturedProducts(limit: number): Promise<Product[]>

// Get best sellers
async function getBestSellers(limit: number): Promise<Product[]>

// Get new arrivals
async function getNewArrivals(limit: number): Promise<Product[]>
```

#### Order Queries
```typescript
// Get user orders
async function getUserOrders(userId: string): Promise<Order[]>

// Get order with items
async function getOrder(id: string): Promise<Order & {
  items: (OrderItem & { product: Product })[]
}>

// Get admin orders with filters
async function getAdminOrders(
  filters: OrderFilters,
  pagination: Pagination
): Promise<PaginatedOrders>
```

#### Analytics Queries
```typescript
interface AnalyticsData {
  totalRevenue: number
  orderCount: number
  customerCount: number
  averageOrderValue: number
  topProducts: Array<{ product: Product; totalSales: number }>
  revenueByDay: Array<{ date: Date; revenue: number }>
}

async function getAnalytics(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsData>
```

### Caching Strategy

- **Product listings**: Cache for 60 seconds (ISR)
- **Product details**: Cache for 60 seconds (ISR)
- **Homepage**: Cache for 300 seconds (ISR)
- **User-specific data**: No caching (dynamic)
- **Admin data**: No caching (dynamic)
- **Static assets**: CDN caching (Cloudinary for images)

### Data Validation

All data inputs are validated using Zod schemas:

```typescript
const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  fragranceType: z.nativeEnum(FragranceType).optional(),
  topNotes: z.array(z.string()).optional(),
  heartNotes: z.array(z.string()).optional(),
  baseNotes: z.array(z.string()).optional(),
  longevity: z.nativeEnum(Longevity).optional(),
  strength: z.nativeEnum(Strength).optional(),
  gender: z.nativeEnum(Gender).optional(),
})

const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddress: AddressSchema,
  couponCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().optional(),
})

const ReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).max(1000),
})
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Authorization Properties

**Property 1: User registration creates authenticated session**
*For any* valid email and password combination, when a customer registers, the system should create a new user account and establish an authenticated session.
**Validates: Requirements 1.1**

**Property 2: Valid credentials authenticate users**
*For any* existing user with valid credentials, login should authenticate the user and create a valid session.
**Validates: Requirements 1.2**

**Property 3: OAuth authentication creates or links accounts**
*For any* successful OAuth response from Google, the system should either create a new account or link to an existing account with matching email.
**Validates: Requirements 1.3**

**Property 4: Password reset generates secure tokens**
*For any* password reset request, the system should generate a cryptographically secure token and send a reset email.
**Validates: Requirements 1.4**

**Property 5: Admin routes require admin role**
*For any* admin route access attempt, the system should only grant access if the authenticated user has admin role.
**Validates: Requirements 1.5**

**Property 6: Session expiry preserves destination**
*For any* expired session, redirecting to login should preserve the originally requested URL for post-login redirect.
**Validates: Requirements 1.6**

**Property 7: Logout invalidates session**
*For any* logout action, the system should invalidate the session token and clear all authentication state.
**Validates: Requirements 1.7**

### Product Catalog Properties

**Property 8: Product filters match all criteria**
*For any* combination of filters (price, fragrance type, gender, longevity, strength), the returned products should match all selected filter criteria.
**Validates: Requirements 2.2**

**Property 9: Product sorting orders correctly**
*For any* sort criterion (price, date, popularity), products should be ordered according to that criterion in the specified direction.
**Validates: Requirements 2.3**

**Property 10: Search matches across multiple fields**
*For any* search query, results should include products where the query matches the name, description, or any fragrance note.
**Validates: Requirements 2.4, 14.1**

**Property 11: Product detail pages contain required information**
*For any* product, the detail page should display images, fragrance profile, price, stock status, and reviews.
**Validates: Requirements 2.5**

**Property 12: Out of stock products disable purchase**
*For any* product with stock quantity of zero, the system should display "Out of Stock" status and disable the add to cart button.
**Validates: Requirements 2.7**

**Property 13: Fragrance notes are organized by type**
*For any* product with fragrance notes, they should be grouped and displayed as top notes, heart notes, and base notes.
**Validates: Requirements 2.8**

**Property 14: Search and filters combine correctly**
*For any* search query with active filters, results should match both the search term and all filter criteria.
**Validates: Requirements 14.4**

**Property 15: Clearing search preserves filters**
*For any* active filter state, clearing the search query should maintain the filter selections.
**Validates: Requirements 14.5**

### Shopping Cart Properties

**Property 16: Cart state management is consistent**
*For any* cart operation (add, update quantity, remove), the cart should maintain consistent state with correct item counts and totals.
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 17: Coupon validation enforces all rules**
*For any* coupon application attempt, the system should validate: coupon exists, is active, not expired, usage limit not reached, and minimum order value met.
**Validates: Requirements 3.4, 3.5, 11.2, 11.3, 11.4, 11.6**

**Property 18: Cart persists for authenticated users**
*For any* authenticated user, cart contents should persist across sessions and browser closures.
**Validates: Requirements 3.6**

**Property 19: Cart quantity respects stock limits**
*For any* product addition to cart, if requested quantity exceeds available stock, the system should limit quantity to available stock and notify the customer.
**Validates: Requirements 3.7**

### Checkout and Payment Properties

**Property 20: Address validation requires all fields**
*For any* shipping address submission, the system should reject addresses missing required fields (name, address, city, postal code, phone).
**Validates: Requirements 4.2**

**Property 21: Payment gateway initializes securely**
*For any* payment method selection, the system should initialize a secure payment session with the payment gateway.
**Validates: Requirements 4.3**

**Property 22: Successful payment completes order flow**
*For any* successful payment, the system should create an order record, clear the cart, and send confirmation email.
**Validates: Requirements 4.4**

**Property 23: Failed payment preserves cart state**
*For any* failed payment, the system should display an error message, preserve cart contents, and allow retry.
**Validates: Requirements 4.5**

**Property 24: Guest checkout works without authentication**
*For any* guest user, checkout should complete successfully without requiring account creation.
**Validates: Requirements 4.6**

**Property 25: Authenticated checkout pre-fills addresses**
*For any* authenticated user with saved addresses, checkout should pre-populate the shipping address form.
**Validates: Requirements 4.7**

**Property 26: Order creation generates unique identifiers**
*For any* order creation, the system should generate a unique order number and set initial status to "pending".
**Validates: Requirements 4.8**

### Order Management Properties

**Property 27: Orders sort by date descending**
*For any* user's order list, orders should be sorted by creation date with newest first.
**Validates: Requirements 5.1**

**Property 28: Order details display complete information**
*For any* order, the detail view should display all items, quantities, prices, shipping address, and current status.
**Validates: Requirements 5.2**

**Property 29: Order status changes trigger notifications**
*For any* order status update, the system should send an email notification to the customer.
**Validates: Requirements 5.3, 16.2, 16.3**

**Property 30: Order tracking displays current status**
*For any* order, the tracking view should display the current status and estimated delivery date.
**Validates: Requirements 5.4**

**Property 31: Admin order updates persist and notify**
*For any* admin order status update, the system should persist the new status and trigger customer notification.
**Validates: Requirements 5.5, 9.2**

### Review and Rating Properties

**Property 32: Review submission creates pending record**
*For any* review submission with rating and text, the system should create a review with "pending" status.
**Validates: Requirements 6.1**

**Property 33: Review approval makes review visible**
*For any* review approval, the system should display the review on the product page and recalculate the product's average rating.
**Validates: Requirements 6.2**

**Property 34: Review status determines visibility**
*For any* product, only reviews with "approved" status should be displayed, sorted by date (newest first).
**Validates: Requirements 6.3, 6.4**

**Property 35: Average rating calculation is accurate**
*For any* product with approved reviews, the average rating should equal the sum of ratings divided by the count of approved reviews.
**Validates: Requirements 6.5**

**Property 36: Purchase verification marks reviews**
*For any* review, if the user has not purchased the product, the review should be marked as "unverified purchase".
**Validates: Requirements 6.6**

### Wishlist Properties

**Property 37: Wishlist operations update count**
*For any* wishlist operation (add or remove), the system should update the wishlist item count correctly.
**Validates: Requirements 7.1, 7.2**

**Property 38: Wishlist displays current product data**
*For any* wishlist view, products should display current prices and stock status.
**Validates: Requirements 7.3**

**Property 39: Wishlist to cart preserves wishlist**
*For any* wishlist item added to cart, the item should remain in the wishlist.
**Validates: Requirements 7.4**

**Property 40: Wishlist reflects stock changes**
*For any* product in wishlist that goes out of stock, the wishlist view should display "Out of Stock" status.
**Validates: Requirements 7.5**

### Admin Product Management Properties

**Property 41: Product creation validates required fields**
*For any* product creation attempt, the system should reject products missing required fields (name, description, price, category, stock).
**Validates: Requirements 8.1**

**Property 42: Image upload stores in Cloudinary**
*For any* product image upload, the system should store the image in Cloudinary and associate the URL with the product.
**Validates: Requirements 8.2, 17.1**

**Property 43: Product updates persist immediately**
*For any* product update, changes should persist to the database and reflect in product displays immediately.
**Validates: Requirements 8.3**

**Property 44: Product deletion is soft delete**
*For any* product deletion, the system should mark the product as deleted (soft delete) and hide it from customer views without removing from database.
**Validates: Requirements 8.4**

**Property 45: Featured products appear on homepage**
*For any* product marked as featured, it should appear in the featured section on the homepage.
**Validates: Requirements 8.5, 12.2**

**Property 46: Stock updates reflect availability**
*For any* stock quantity update, the system should update inventory and reflect the new availability status on product pages.
**Validates: Requirements 8.6**

**Property 47: Fragrance profile validation**
*For any* fragrance profile creation, the system should validate that longevity and strength are valid enum values and notes are non-empty arrays.
**Validates: Requirements 8.7**

### Admin Order Management Properties

**Property 48: Order filters narrow results correctly**
*For any* combination of order filters (status, date range, customer), the system should return only orders matching all filter criteria.
**Validates: Requirements 9.1**

**Property 49: Order details display all information**
*For any* order in admin view, the detail page should display customer information, order items, payment status, and shipping address.
**Validates: Requirements 9.3**

**Property 50: Refund processing updates order**
*For any* refund processed by admin, the system should update order status to "refunded" and record the refund amount.
**Validates: Requirements 9.4**

**Property 51: Order search finds matching orders**
*For any* search query, the system should return orders where the query matches order number, customer name, or customer email.
**Validates: Requirements 9.5, 23.3**

### Analytics Properties

**Property 52: Analytics calculate for date range**
*For any* selected date range, the system should calculate total revenue, order count, and customer count for only orders within that range.
**Validates: Requirements 10.1, 10.5**

**Property 53: Sales trends aggregate by time period**
*For any* date range, revenue should be grouped by day and displayed chronologically.
**Validates: Requirements 10.2**

**Property 54: Top products rank by sales volume**
*For any* time period, products should be ranked by total quantity sold in descending order.
**Validates: Requirements 10.3, 12.3**

**Property 55: Customer metrics calculate correctly**
*For any* time period, new customer count should equal users created in that period, and returning customer percentage should equal (orders from existing customers / total orders) * 100.
**Validates: Requirements 10.4**

### Coupon Management Properties

**Property 56: Coupon creation validates required fields**
*For any* coupon creation attempt, the system should reject coupons missing required fields (code, discount type, value, expiry date).
**Validates: Requirements 11.1**

**Property 57: Coupon usage limit auto-deactivates**
*For any* coupon that reaches its maximum usage count, the system should automatically mark it as inactive.
**Validates: Requirements 11.5**

### Homepage Content Properties

**Property 58: Best sellers rank by sales**
*For any* homepage view, best sellers should display the top 8 products ranked by total sales volume.
**Validates: Requirements 12.3**

**Property 59: New arrivals filter by date**
*For any* homepage view, new arrivals should display products created within the last 30 days, limited to top 8.
**Validates: Requirements 12.4**

**Property 60: Testimonials show only approved**
*For any* homepage view, only testimonials with approved status should be displayed.
**Validates: Requirements 12.5**

**Property 61: Newsletter signup validates email**
*For any* newsletter signup, the system should validate the email format and add valid emails to the mailing list.
**Validates: Requirements 12.6**

### Customer Profile Properties

**Property 62: Profile updates validate and persist**
*For any* profile update (name, email, phone), the system should validate the data and persist changes.
**Validates: Requirements 13.1**

**Property 63: Address creation validates required fields**
*For any* address creation, the system should validate required fields and save valid addresses.
**Validates: Requirements 13.2**

**Property 64: Default address pre-selects at checkout**
*For any* user with a default address, checkout should pre-select that address.
**Validates: Requirements 13.3**

**Property 65: Address deletion removes from saved**
*For any* address deletion, the system should remove the address from the user's saved addresses.
**Validates: Requirements 13.4**

**Property 66: Password update validates strength**
*For any* password update, the system should validate password strength requirements and update credentials.
**Validates: Requirements 13.5**

### Image Management Properties

**Property 67: Image deletion removes from storage**
*For any* product image deletion, the system should remove the image from Cloudinary and update the product record.
**Validates: Requirements 17.3**

**Property 68: Image reordering persists**
*For any* image reorder operation, the system should persist the new order and display images in that order.
**Validates: Requirements 17.4**

**Property 69: Primary image displays in grids**
*For any* product with multiple images, the first image should be displayed as the primary image in grid views.
**Validates: Requirements 17.5**

**Property 70: Responsive images serve correct sizes**
*For any* product image display, the system should serve appropriately sized images based on viewport dimensions.
**Validates: Requirements 17.2**

### Inventory Management Properties

**Property 71: Purchase decreases stock**
*For any* completed order, the system should decrease each product's stock by the ordered quantity.
**Validates: Requirements 18.1**

**Property 72: Zero stock disables purchase**
*For any* product with stock quantity of zero, the system should mark it as out of stock and disable the add to cart button.
**Validates: Requirements 18.2**

**Property 73: Stock updates validate non-negative**
*For any* stock quantity update, the system should reject negative values.
**Validates: Requirements 18.3**

**Property 74: Low stock displays indicator**
*For any* product with stock below 5 units, the system should display a "Low Stock" indicator on the product page.
**Validates: Requirements 18.4**

**Property 75: Order cancellation restores stock**
*For any* order cancellation, the system should restore product stock by the cancelled quantities.
**Validates: Requirements 18.5**

### Category Management Properties

**Property 76: Category names must be unique**
*For any* category creation, the system should reject categories with duplicate names.
**Validates: Requirements 19.1**

**Property 77: Category assignment updates associations**
*For any* product category assignment, the system should update the product-category relationship.
**Validates: Requirements 19.2**

**Property 78: Category filter shows correct products**
*For any* category filter selection, the system should display only products assigned to that category.
**Validates: Requirements 19.3**

**Property 79: Category deletion unassigns products**
*For any* category deletion, the system should unassign all products from that category.
**Validates: Requirements 19.4**

**Property 80: Category displays product count**
*For any* category, the displayed product count should equal the number of products assigned to that category.
**Validates: Requirements 19.5**

### Error Handling Properties

**Property 81: Form validation displays field errors**
*For any* form submission with invalid fields, the system should display specific error messages for each invalid field.
**Validates: Requirements 21.1**

**Property 82: Network failures show retry option**
*For any* failed network request, the system should display a user-friendly error message and provide a retry option.
**Validates: Requirements 21.2**

**Property 83: Payment failures show specific errors**
*For any* payment failure, the system should display the specific error reason and suggested actions.
**Validates: Requirements 21.3**

**Property 84: Server errors log and display safely**
*For any* server error, the system should log detailed error information and display a generic user-friendly message.
**Validates: Requirements 21.4**

**Property 85: Invalid data prevents submission**
*For any* form with invalid data, the system should prevent submission and highlight invalid fields.
**Validates: Requirements 21.5**

### Security Properties

**Property 86: Passwords are hashed before storage**
*For any* password storage, the system should hash the password using bcrypt before persisting to the database.
**Validates: Requirements 22.2**

**Property 87: Credit card data is never stored**
*For any* payment processing, the system should never persist full credit card details to the database.
**Validates: Requirements 22.3**

**Property 88: Session tokens are cryptographically secure**
*For any* session token generation, the system should use cryptographically secure random values with sufficient entropy.
**Validates: Requirements 22.4**

**Property 89: Protected endpoints require authentication**
*For any* protected API endpoint access, the system should validate authentication and authorization before processing the request.
**Validates: Requirements 22.5**

**Property 90: User input is sanitized**
*For any* user input that is rendered in HTML, the system should sanitize it to prevent XSS attacks.
**Validates: Requirements 22.6**

### Admin Customer Management Properties

**Property 91: Customer details display complete information**
*For any* customer in admin view, the detail page should display profile information, order history, and total spend.
**Validates: Requirements 23.2**

**Property 92: Customer orders filter and sort correctly**
*For any* customer's order list in admin view, orders should be filtered to that customer and sorted by date (newest first).
**Validates: Requirements 23.4**

**Property 93: Customer contact information is accessible**
*For any* customer detail view, the system should display the customer's email and phone number.
**Validates: Requirements 23.5**

### Accessibility Properties

**Property 94: Product images have alt text**
*For any* product image, the system should provide descriptive alt text.
**Validates: Requirements 24.3**


## Error Handling

### Error Categories and Handling Strategies

#### 1. Validation Errors (Client-side)
**Trigger**: Invalid user input in forms
**Handling**:
- Validate on blur and on submit
- Display inline error messages below fields
- Prevent form submission until valid
- Use Zod schemas for consistent validation

**Example**:
```typescript
const emailError = "Please enter a valid email address"
const passwordError = "Password must be at least 8 characters"
```

#### 2. API Errors (Server-side)
**Trigger**: Server action or API route failures
**Handling**:
- Return structured error objects: `{ success: false, error: string }`
- Display toast notifications for errors
- Log detailed errors server-side
- Provide user-friendly messages

**Error Types**:
- `400 Bad Request`: Validation errors, malformed requests
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `500 Internal Server Error`: Unexpected server errors

#### 3. Payment Errors
**Trigger**: Payment gateway failures
**Handling**:
- Preserve cart state
- Display specific error from payment gateway
- Provide retry option
- Log payment failures for investigation

**Common Payment Errors**:
- Insufficient funds
- Card declined
- Invalid card details
- Payment timeout
- Gateway unavailable

#### 4. Network Errors
**Trigger**: Connection failures, timeouts
**Handling**:
- Display "Connection lost" message
- Provide manual retry button
- Implement automatic retry with exponential backoff for critical operations
- Cache data when possible for offline resilience

#### 5. Authentication Errors
**Trigger**: Invalid credentials, expired sessions
**Handling**:
- Redirect to login page with return URL
- Display clear error messages
- Preserve form data when possible
- Implement session refresh for expired tokens

#### 6. Stock/Inventory Errors
**Trigger**: Product out of stock during checkout
**Handling**:
- Check stock before payment
- Display clear message if stock insufficient
- Update cart to reflect available stock
- Suggest alternative products

#### 7. File Upload Errors
**Trigger**: Image upload failures (size, format, network)
**Handling**:
- Validate file size and format client-side
- Display progress indicator
- Show specific error (too large, wrong format, upload failed)
- Allow retry without losing other form data

### Error Logging Strategy

**Client-side Logging**:
- Log errors to console in development
- Send critical errors to monitoring service (e.g., Sentry) in production
- Include user context (authenticated user ID, page, action)

**Server-side Logging**:
- Log all errors with stack traces
- Include request context (user, endpoint, parameters)
- Use structured logging (JSON format)
- Set up alerts for critical errors (payment failures, auth issues)

### Error Recovery Patterns

**Optimistic Updates**:
- Update UI immediately
- Revert on error
- Show error message
- Example: Adding to cart, wishlist

**Retry Logic**:
- Automatic retry for transient failures (network issues)
- Exponential backoff: 1s, 2s, 4s
- Maximum 3 retries
- Manual retry button for user-initiated actions

**Graceful Degradation**:
- Show cached data if fresh data unavailable
- Disable features that require unavailable services
- Display informative messages about limited functionality

## Testing Strategy

### Dual Testing Approach

The testing strategy combines **unit tests** for specific examples and edge cases with **property-based tests** for universal correctness properties. Both approaches are complementary and necessary for comprehensive coverage.

**Unit Tests**: Focus on specific examples, edge cases, error conditions, and integration points between components.

**Property Tests**: Verify universal properties across all inputs through randomized testing, ensuring correctness at scale.

### Testing Framework Selection

**Property-Based Testing Library**: 
- **fast-check** (for TypeScript/JavaScript)
- Mature, well-maintained library with excellent TypeScript support
- Integrates seamlessly with Jest/Vitest
- Provides rich set of arbitraries for generating test data

**Unit Testing Framework**:
- **Vitest** (preferred for Next.js projects)
- Fast, modern, Vite-powered test runner
- Excellent TypeScript support
- Compatible with Jest API

**E2E Testing**:
- **Playwright** for end-to-end testing
- Test critical user flows (checkout, authentication)
- Run in CI/CD pipeline

### Property-Based Test Configuration

**Minimum Iterations**: Each property test must run at least **100 iterations** to ensure adequate coverage through randomization.

**Test Tagging**: Each property-based test must include a comment referencing the design document property:
```typescript
// Feature: dachhomeandbody-ecommerce, Property 16: Cart state management is consistent
```

**Property Test Structure**:
```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Cart Management', () => {
  // Feature: dachhomeandbody-ecommerce, Property 16: Cart state management is consistent
  it('maintains consistent state for all cart operations', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary),
        fc.array(cartOperationArbitrary),
        (products, operations) => {
          const cart = new Cart()
          let expectedTotal = 0
          
          operations.forEach(op => {
            if (op.type === 'add') {
              cart.addItem(op.productId, op.quantity)
              expectedTotal += products.find(p => p.id === op.productId).price * op.quantity
            }
            // ... other operations
          })
          
          expect(cart.total).toBe(expectedTotal)
          expect(cart.items.length).toBe(/* expected count */)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Test Coverage by Layer

#### 1. Data Layer Tests (Prisma/Database)

**Unit Tests**:
- Test database queries return correct data
- Test relationships are properly loaded
- Test transactions rollback on error
- Mock database for fast tests

**Property Tests**:
- Property 35: Average rating calculation
- Property 52: Analytics calculations for date ranges
- Property 71: Stock decreases on purchase
- Property 75: Stock restoration on cancellation

#### 2. Service Layer Tests

**Unit Tests**:
- Test authentication service (login, register, password reset)
- Test payment service integration (mock payment gateway)
- Test email service (mock email sending)
- Test image upload service (mock Cloudinary)

**Property Tests**:
- Property 1: User registration
- Property 2: User authentication
- Property 17: Coupon validation
- Property 86: Password hashing

#### 3. API Layer Tests (Server Actions & Routes)

**Unit Tests**:
- Test server actions with valid inputs
- Test error handling for invalid inputs
- Test authorization checks
- Test webhook handling

**Property Tests**:
- Property 8: Product filtering
- Property 9: Product sorting
- Property 10: Search functionality
- Property 48: Order filtering

#### 4. Component Tests (React)

**Unit Tests**:
- Test component rendering with props
- Test user interactions (clicks, form submissions)
- Test conditional rendering
- Test error states
- Use React Testing Library

**Property Tests**:
- Property 11: Product detail pages contain required information
- Property 28: Order details display complete information
- Property 94: Images have alt text

#### 5. Integration Tests

**Unit Tests**:
- Test complete user flows (add to cart → checkout → payment)
- Test admin workflows (create product → upload images → publish)
- Test authentication flows (register → verify email → login)

**Property Tests**:
- Property 22: Successful payment completes order flow
- Property 23: Failed payment preserves cart state

#### 6. E2E Tests (Playwright)

**Critical User Flows**:
- Guest checkout flow
- Authenticated user checkout flow
- Product search and filtering
- Admin product creation
- Order status updates

### Test Data Generation (Arbitraries)

**Product Arbitrary**:
```typescript
const productArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  price: fc.float({ min: 1, max: 10000, noNaN: true }),
  stock: fc.nat({ max: 1000 }),
  fragranceType: fc.constantFrom(...Object.values(FragranceType)),
  longevity: fc.constantFrom(...Object.values(Longevity)),
  strength: fc.constantFrom(...Object.values(Strength)),
})
```

**User Arbitrary**:
```typescript
const userArbitrary = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constantFrom(UserRole.CUSTOMER, UserRole.ADMIN),
})
```

**Order Arbitrary**:
```typescript
const orderArbitrary = fc.record({
  id: fc.uuid(),
  items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 10 }),
  status: fc.constantFrom(...Object.values(OrderStatus)),
  total: fc.float({ min: 1, max: 100000, noNaN: true }),
})
```

### Testing Best Practices

1. **Avoid Over-Testing**: Don't write excessive unit tests for scenarios covered by property tests. Property tests handle broad input coverage.

2. **Focus Unit Tests On**:
   - Specific edge cases (empty cart, single item, maximum items)
   - Error conditions (network failures, validation errors)
   - Integration points (API boundaries, external services)
   - UI interactions (button clicks, form submissions)

3. **Property Tests Should**:
   - Test universal properties that hold for all inputs
   - Use randomized data generation
   - Run minimum 100 iterations
   - Reference design document properties in comments

4. **Mock External Services**:
   - Payment gateways (Paystack, Flutterwave)
   - Email service (Resend)
   - Image storage (Cloudinary)
   - OAuth providers (Google)

5. **Test Database Interactions**:
   - Use test database or in-memory database
   - Clean up after each test
   - Use transactions for isolation

6. **Accessibility Testing**:
   - Use jest-axe for automated accessibility checks
   - Test keyboard navigation
   - Test screen reader compatibility
   - Manual testing with assistive technologies required for full WCAG compliance

### Continuous Integration

**CI Pipeline**:
1. Run linting (ESLint, Prettier)
2. Run type checking (TypeScript)
3. Run unit tests
4. Run property-based tests
5. Run integration tests
6. Run E2E tests (on main branch only)
7. Generate coverage report (target: 80%+ coverage)

**Pre-commit Hooks**:
- Format code with Prettier
- Lint with ESLint
- Run type checking
- Run fast unit tests

### Performance Testing

While not part of the core testing strategy, performance should be monitored:
- Lighthouse CI for page performance
- Load testing for API endpoints (k6 or Artillery)
- Database query performance monitoring
- Image optimization verification

## Implementation Notes

### Development Workflow

1. **Environment Setup**:
   - Clone repository
   - Install dependencies: `npm install`
   - Set up environment variables (`.env.local`)
   - Run database migrations: `npx prisma migrate dev`
   - Seed database: `npx prisma db seed`

2. **Development Server**:
   - Start dev server: `npm run dev`
   - Access at `http://localhost:3000`
   - Admin panel at `http://localhost:3000/admin`

3. **Database Management**:
   - View database: `npx prisma studio`
   - Create migration: `npx prisma migrate dev --name <name>`
   - Reset database: `npx prisma migrate reset`

### Deployment Considerations

**Vercel Deployment**:
- Automatic deployments from main branch
- Preview deployments for pull requests
- Environment variables configured in Vercel dashboard
- Database connection pooling via Prisma Data Proxy

**Environment Variables**:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```

**Database Migrations**:
- Run migrations before deployment
- Use Prisma Migrate in production
- Backup database before major migrations

### Security Considerations

1. **Authentication**: Use Auth.js with secure session configuration
2. **Authorization**: Implement middleware to protect admin routes
3. **Input Validation**: Validate all inputs with Zod schemas
4. **SQL Injection**: Use Prisma ORM (parameterized queries)
5. **XSS Prevention**: Sanitize user input, use React's built-in escaping
6. **CSRF Protection**: Use Auth.js CSRF tokens
7. **Rate Limiting**: Implement rate limiting on API routes
8. **HTTPS**: Enforce HTTPS in production (Vercel handles this)

### Performance Optimization

1. **Image Optimization**: Use Next.js Image component with Cloudinary
2. **Code Splitting**: Leverage Next.js automatic code splitting
3. **Caching**: Implement ISR for product pages, use React Query for client-side caching
4. **Database Indexing**: Add indexes on frequently queried fields (slug, email, orderNumber)
5. **Lazy Loading**: Lazy load below-fold images and components
6. **Bundle Size**: Monitor and optimize bundle size with Next.js bundle analyzer

### Monitoring and Observability

1. **Error Tracking**: Integrate Sentry for error monitoring
2. **Analytics**: Use Vercel Analytics or Google Analytics
3. **Performance Monitoring**: Use Vercel Speed Insights
4. **Logging**: Implement structured logging with Winston or Pino
5. **Uptime Monitoring**: Use UptimeRobot or similar service

## Conclusion

This design document provides a comprehensive blueprint for the Dachhomeandbody luxury e-commerce platform. The architecture leverages modern Next.js features for optimal performance and developer experience, while the property-based testing strategy ensures correctness at scale. The design emphasizes security, accessibility, and user experience, creating a premium shopping experience that matches the luxury brand aesthetic.
