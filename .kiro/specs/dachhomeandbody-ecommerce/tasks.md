# Implementation Plan: Dachhomeandbody E-Commerce Platform

## Overview

This implementation plan breaks down the luxury e-commerce platform into discrete, manageable coding tasks. The approach follows an incremental development strategy, building core infrastructure first, then implementing features layer by layer, with testing integrated throughout. Each task builds on previous work, ensuring no orphaned code.

The implementation uses Next.js 14+ (App Router), TypeScript, Prisma ORM, PostgreSQL, and integrates with external services (Cloudinary, Paystack, Resend, Auth.js).

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure TailwindCSS with luxury design tokens (colors, typography, spacing)
  - Set up Prisma with PostgreSQL connection
  - Create database schema from design document (User, Product, Order, Review, Category, Coupon models)
  - Run initial migration and verify database connection
  - Configure environment variables structure
  - Set up ESLint, Prettier, and TypeScript strict mode
  - _Requirements: All (foundational)_

- [ ] 2. Authentication system implementation
  - [ ] 2.1 Configure Auth.js with credentials and Google OAuth providers
    - Set up NextAuth configuration with session strategy
    - Implement credentials provider with bcrypt password hashing
    - Configure Google OAuth provider
    - Create auth API routes
    - _Requirements: 1.1, 1.2, 1.3, 22.2_

  - [ ]* 2.2 Write property tests for authentication
    - **Property 1: User registration creates authenticated session**
    - **Property 2: Valid credentials authenticate users**
    - **Property 86: Passwords are hashed before storage**
    - **Validates: Requirements 1.1, 1.2, 22.2**

  - [~] 2.3 Implement password reset flow
    - Create password reset token generation
    - Build password reset email template
    - Implement reset token validation and password update
    - _Requirements: 1.4, 16.4_

  - [ ]* 2.4 Write property test for password reset
    - **Property 4: Password reset generates secure tokens**
    - **Validates: Requirements 1.4**

  - [~] 2.5 Create authentication middleware for route protection
    - Implement middleware to check authentication status
    - Add role-based authorization (admin vs customer)
    - Protect admin routes with admin role check
    - _Requirements: 1.5, 1.6, 22.5_

  - [ ]* 2.6 Write property tests for authorization
    - **Property 5: Admin routes require admin role**
    - **Property 89: Protected endpoints require authentication**
    - **Validates: Requirements 1.5, 22.5**

  - [~] 2.7 Build authentication UI components
    - Create login page with email/password and Google OAuth
    - Create registration page with validation
    - Create password reset request and confirmation pages
    - Implement logout functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_

- [ ] 3. Database access layer and core services
  - [~] 3.1 Create Prisma client singleton and database utilities
    - Set up Prisma client with connection pooling
    - Create database utility functions for common operations
    - Implement transaction helpers
    - _Requirements: All (foundational)_

  - [~] 3.2 Implement product data access functions
    - Create getProducts with filtering, sorting, pagination
    - Create getProduct by slug with relations
    - Create getFeaturedProducts, getBestSellers, getNewArrivals
    - Create admin product CRUD operations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.3, 8.4, 12.2, 12.3, 12.4_

  - [ ]* 3.3 Write property tests for product queries
    - **Property 8: Product filters match all criteria**
    - **Property 9: Product sorting orders correctly**
    - **Property 10: Search matches across multiple fields**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [~] 3.4 Implement order data access functions
    - Create createOrder with transaction support
    - Create getUserOrders with pagination
    - Create getOrder with items and product relations
    - Create admin order queries with filters
    - _Requirements: 4.4, 5.1, 5.2, 9.1, 9.3_

  - [~] 3.5 Implement review data access functions
    - Create createReview, approveReview, rejectReview
    - Create getProductReviews with approved filter
    - Implement average rating calculation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.6 Write property test for review calculations
    - **Property 35: Average rating calculation is accurate**
    - **Validates: Requirements 6.5**

  - [~] 3.7 Implement coupon data access functions
    - Create validateCoupon with all validation rules
    - Create admin coupon CRUD operations
    - Implement usage tracking and auto-deactivation
    - _Requirements: 3.4, 3.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 3.8 Write property test for coupon validation
    - **Property 17: Coupon validation enforces all rules**
    - **Validates: Requirements 3.4, 3.5, 11.2, 11.3, 11.4, 11.6**

- [ ] 4. External service integrations
  - [~] 4.1 Set up Cloudinary image upload service
    - Configure Cloudinary SDK with credentials
    - Create image upload API route
    - Implement image deletion and URL generation
    - Add image optimization settings
    - _Requirements: 8.2, 17.1, 17.2, 17.3_

  - [ ]* 4.2 Write property tests for image management
    - **Property 42: Image upload stores in Cloudinary**
    - **Property 67: Image deletion removes from storage**
    - **Validates: Requirements 8.2, 17.1, 17.3**

  - [~] 4.3 Set up Resend email service
    - Configure Resend SDK with API key
    - Create email templates (order confirmation, shipping, password reset, newsletter)
    - Implement email sending utility functions
    - _Requirements: 4.4, 5.3, 12.6, 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 4.4 Write property tests for email notifications
    - **Property 29: Order status changes trigger notifications**
    - **Validates: Requirements 5.3, 16.2, 16.3**

  - [~] 4.5 Integrate Paystack payment gateway
    - Configure Paystack SDK with secret key
    - Create payment initialization endpoint
    - Implement payment webhook handler
    - Add payment verification logic
    - _Requirements: 4.3, 4.4, 4.5_

  - [ ]* 4.6 Write property tests for payment flow
    - **Property 22: Successful payment completes order flow**
    - **Property 23: Failed payment preserves cart state**
    - **Validates: Requirements 4.4, 4.5**

- [ ] 5. Product catalog implementation
  - [~] 5.1 Create product listing page with filters
    - Build shop page with product grid
    - Implement filter sidebar (price, fragrance type, gender, longevity, strength)
    - Add sort dropdown (price, newest, popularity)
    - Implement search functionality
    - Add pagination
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 14.1, 14.4_

  - [ ]* 5.2 Write property tests for filtering and search
    - **Property 14: Search and filters combine correctly**
    - **Property 15: Clearing search preserves filters**
    - **Validates: Requirements 14.4, 14.5**

  - [~] 5.3 Create product detail page
    - Build product detail layout with image gallery
    - Display fragrance profile (notes, longevity, strength)
    - Show price, stock status, and add to cart button
    - Display customer reviews with ratings
    - Add related products section
    - Implement image zoom functionality
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 6.4_

  - [ ]* 5.4 Write property tests for product display
    - **Property 11: Product detail pages contain required information**
    - **Property 12: Out of stock products disable purchase**
    - **Property 13: Fragrance notes are organized by type**
    - **Validates: Requirements 2.5, 2.7, 2.8**

  - [~] 5.4 Create reusable product components
    - Build ProductCard component for grid display
    - Create ProductGallery with zoom and swipe support
    - Build FragranceProfile visualization component
    - Create ProductFilters component
    - _Requirements: 2.1, 2.5, 2.6, 2.8_

- [ ] 6. Shopping cart implementation
  - [~] 6.1 Implement cart state management
    - Create cart context with React Context API
    - Implement add, update, remove cart operations
    - Add cart persistence for authenticated users
    - Implement stock validation on add to cart
    - Calculate subtotal and total
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

  - [ ]* 6.2 Write property tests for cart operations
    - **Property 16: Cart state management is consistent**
    - **Property 19: Cart quantity respects stock limits**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.7**

  - [~] 6.3 Build cart UI components
    - Create CartDrawer slide-out component
    - Build CartItem component with quantity controls
    - Create CartSummary with totals
    - Add CouponInput component with validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 6.4 Implement cart persistence
    - Save cart to database for authenticated users
    - Load cart on login
    - Merge guest cart with user cart on login
    - _Requirements: 3.6_

  - [ ]* 6.5 Write property test for cart persistence
    - **Property 18: Cart persists for authenticated users**
    - **Validates: Requirements 3.6**

- [~] 7. Checkpoint - Verify core functionality
  - Ensure all tests pass
  - Verify authentication flow works end-to-end
  - Test product browsing and filtering
  - Test cart operations
  - Ask the user if questions arise

- [ ] 8. Checkout and payment flow
  - [~] 8.1 Create checkout page with multi-step form
    - Build checkout layout with order summary
    - Create shipping address form with validation
    - Add payment method selection
    - Implement guest checkout support
    - Pre-fill saved addresses for authenticated users
    - _Requirements: 4.1, 4.2, 4.6, 4.7_

  - [ ]* 8.2 Write property tests for checkout validation
    - **Property 20: Address validation requires all fields**
    - **Property 24: Guest checkout works without authentication**
    - **Property 25: Authenticated checkout pre-fills addresses**
    - **Validates: Requirements 4.2, 4.6, 4.7**

  - [~] 8.3 Implement payment processing
    - Initialize Paystack payment session
    - Handle payment success callback
    - Handle payment failure
    - Create order on successful payment
    - Clear cart after order creation
    - Send order confirmation email
    - _Requirements: 4.3, 4.4, 4.5, 16.1_

  - [~] 8.4 Create order confirmation page
    - Display order details and order number
    - Show estimated delivery date
    - Provide order tracking link
    - _Requirements: 4.8, 5.4_

  - [ ]* 8.5 Write property test for order creation
    - **Property 26: Order creation generates unique identifiers**
    - **Validates: Requirements 4.8**

- [ ] 9. Customer dashboard and profile
  - [~] 9.1 Create customer dashboard layout
    - Build dashboard navigation
    - Create overview page with recent orders
    - _Requirements: 5.1_

  - [~] 9.2 Implement order history page
    - Display all user orders sorted by date
    - Add order status badges
    - Create order detail modal/page
    - Show order tracking information
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 9.3 Write property tests for order display
    - **Property 27: Orders sort by date descending**
    - **Property 28: Order details display complete information**
    - **Validates: Requirements 5.1, 5.2**

  - [~] 9.4 Implement profile management
    - Create profile edit form
    - Add password change functionality
    - Implement address management (add, edit, delete, set default)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 9.5 Write property tests for profile operations
    - **Property 62: Profile updates validate and persist**
    - **Property 64: Default address pre-selects at checkout**
    - **Validates: Requirements 13.1, 13.3**

  - [~] 9.6 Implement wishlist functionality
    - Create wishlist page
    - Add wishlist add/remove operations
    - Display current prices and stock status
    - Add to cart from wishlist
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 9.7 Write property tests for wishlist
    - **Property 37: Wishlist operations update count**
    - **Property 39: Wishlist to cart preserves wishlist**
    - **Validates: Requirements 7.1, 7.2, 7.4**

- [ ] 10. Review and rating system
  - [~] 10.1 Implement review submission
    - Create review form component
    - Add rating input (star selector)
    - Implement review submission with pending status
    - Check purchase verification
    - _Requirements: 6.1, 6.6_

  - [ ]* 10.2 Write property tests for reviews
    - **Property 32: Review submission creates pending record**
    - **Property 36: Purchase verification marks reviews**
    - **Validates: Requirements 6.1, 6.6**

  - [~] 10.3 Display reviews on product pages
    - Show approved reviews sorted by date
    - Display average rating with star visualization
    - Add verified purchase badges
    - _Requirements: 6.4, 6.5_

  - [ ]* 10.4 Write property test for review display
    - **Property 34: Review status determines visibility**
    - **Validates: Requirements 6.3, 6.4**

- [ ] 11. Homepage and content sections
  - [~] 11.1 Create homepage layout
    - Build hero section with video/image support
    - Add featured collections section
    - Create best sellers section
    - Add new arrivals section
    - Build testimonials section
    - Add newsletter signup form
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 11.2 Write property tests for homepage content
    - **Property 58: Best sellers rank by sales**
    - **Property 59: New arrivals filter by date**
    - **Property 61: Newsletter signup validates email**
    - **Validates: Requirements 12.3, 12.4, 12.6**

  - [~] 11.3 Implement responsive navigation
    - Create desktop navigation with mega menu
    - Build mobile hamburger menu
    - Add cart icon with item count
    - Add user account dropdown
    - _Requirements: 15.1, 15.2_

- [ ] 12. Admin dashboard foundation
  - [~] 12.1 Create admin layout and navigation
    - Build admin sidebar navigation
    - Create admin dashboard page with analytics overview
    - Add role-based route protection
    - _Requirements: 10.1, 1.5_

  - [~] 12.2 Implement analytics dashboard
    - Calculate and display total revenue, order count, customer count
    - Create sales trend chart (revenue over time)
    - Display top products by sales volume
    - Show customer metrics (new vs returning)
    - Add date range filter
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 12.3 Write property tests for analytics
    - **Property 52: Analytics calculate for date range**
    - **Property 54: Top products rank by sales volume**
    - **Validates: Requirements 10.1, 10.3, 10.5**

- [ ] 13. Admin product management
  - [~] 13.1 Create product list page for admin
    - Display all products in table/grid
    - Add search and filter functionality
    - Show stock levels and status
    - Add edit and delete actions
    - _Requirements: 8.1, 8.3, 8.4_

  - [~] 13.2 Build product creation form
    - Create multi-step product form
    - Add basic info fields (name, description, price, category)
    - Add fragrance profile fields (notes, longevity, strength)
    - Implement image upload with Cloudinary
    - Add stock and SKU fields
    - _Requirements: 8.1, 8.2, 8.7_

  - [ ]* 13.3 Write property tests for product management
    - **Property 41: Product creation validates required fields**
    - **Property 47: Fragrance profile validation**
    - **Validates: Requirements 8.1, 8.7**

  - [~] 13.3 Implement product edit functionality
    - Load existing product data
    - Allow updating all product fields
    - Support image reordering and deletion
    - Handle featured product toggle
    - _Requirements: 8.3, 8.5, 17.3, 17.4_

  - [ ]* 13.4 Write property tests for product updates
    - **Property 43: Product updates persist immediately**
    - **Property 68: Image reordering persists**
    - **Validates: Requirements 8.3, 17.4**

  - [~] 13.5 Implement product deletion
    - Add soft delete functionality
    - Hide deleted products from customer views
    - Maintain order history references
    - _Requirements: 8.4_

  - [ ]* 13.6 Write property test for soft delete
    - **Property 44: Product deletion is soft delete**
    - **Validates: Requirements 8.4**

- [ ] 14. Admin order management
  - [~] 14.1 Create orders list page for admin
    - Display all orders in table
    - Add filters (status, date range, customer)
    - Implement order search
    - Show order totals and status
    - _Requirements: 9.1, 9.5_

  - [ ]* 14.2 Write property tests for order management
    - **Property 48: Order filters narrow results correctly**
    - **Property 51: Order search finds matching orders**
    - **Validates: Requirements 9.1, 9.5**

  - [~] 14.3 Build order detail page for admin
    - Display complete order information
    - Show customer details and contact info
    - List all order items with products
    - Display payment and shipping info
    - _Requirements: 9.3, 23.5_

  - [~] 14.4 Implement order status management
    - Add status update dropdown
    - Send email notification on status change
    - Update order timestamps (shippedAt, deliveredAt)
    - _Requirements: 5.5, 9.2_

  - [~] 14.5 Add refund processing
    - Create refund form
    - Update order status to refunded
    - Record refund amount
    - _Requirements: 9.4_

  - [ ]* 14.6 Write property test for refunds
    - **Property 50: Refund processing updates order**
    - **Validates: Requirements 9.4**

- [ ] 15. Admin customer and review management
  - [~] 15.1 Create customer list page
    - Display all customers in table
    - Add search functionality
    - Show customer stats (order count, total spend)
    - _Requirements: 23.1, 23.3_

  - [~] 15.2 Build customer detail page
    - Display profile information
    - Show order history for customer
    - Display total spend and order count
    - Show contact information
    - _Requirements: 23.2, 23.4, 23.5_

  - [ ]* 15.3 Write property tests for customer management
    - **Property 91: Customer details display complete information**
    - **Property 92: Customer orders filter and sort correctly**
    - **Validates: Requirements 23.2, 23.4**

  - [~] 15.4 Implement review moderation
    - Create review moderation page
    - Display pending reviews
    - Add approve/reject actions
    - Update product ratings on approval
    - _Requirements: 6.2, 6.3_

  - [ ]* 15.5 Write property test for review moderation
    - **Property 33: Review approval makes review visible**
    - **Validates: Requirements 6.2**

- [ ] 16. Admin coupon and category management
  - [~] 16.1 Create coupon management page
    - Display all coupons in table
    - Show usage stats and status
    - Add create coupon form
    - Implement coupon activation/deactivation
    - _Requirements: 11.1, 11.4_

  - [ ]* 16.2 Write property tests for coupons
    - **Property 56: Coupon creation validates required fields**
    - **Property 57: Coupon usage limit auto-deactivates**
    - **Validates: Requirements 11.1, 11.5**

  - [~] 16.3 Implement category management
    - Create category list page
    - Add create/edit category forms
    - Show product count per category
    - Handle category deletion with product unassignment
    - _Requirements: 19.1, 19.2, 19.4, 19.5_

  - [ ]* 16.4 Write property tests for categories
    - **Property 76: Category names must be unique**
    - **Property 79: Category deletion unassigns products**
    - **Validates: Requirements 19.1, 19.4**

- [ ] 17. Inventory management
  - [~] 17.1 Implement stock tracking
    - Decrease stock on order completion
    - Restore stock on order cancellation
    - Display low stock warnings
    - Disable purchase when out of stock
    - _Requirements: 18.1, 18.2, 18.4, 18.5_

  - [ ]* 17.2 Write property tests for inventory
    - **Property 71: Purchase decreases stock**
    - **Property 72: Zero stock disables purchase**
    - **Property 75: Order cancellation restores stock**
    - **Validates: Requirements 18.1, 18.2, 18.5**

  - [~] 17.3 Add stock management UI for admin
    - Create stock adjustment form
    - Validate non-negative stock values
    - Show stock history/audit log
    - _Requirements: 18.3, 8.6_

  - [ ]* 17.4 Write property test for stock validation
    - **Property 73: Stock updates validate non-negative**
    - **Validates: Requirements 18.3**

- [~] 18. Checkpoint - Verify admin functionality
  - Ensure all admin tests pass
  - Verify product management workflow
  - Test order management and status updates
  - Verify analytics calculations
  - Ask the user if questions arise

- [ ] 19. Error handling and validation
  - [~] 19.1 Implement global error handling
    - Create error boundary components
    - Add API error handling middleware
    - Implement toast notification system
    - Set up error logging
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

  - [ ]* 19.2 Write property tests for error handling
    - **Property 81: Form validation displays field errors**
    - **Property 85: Invalid data prevents submission**
    - **Validates: Requirements 21.1, 21.5**

  - [~] 19.3 Add client-side validation
    - Implement Zod schemas for all forms
    - Add real-time validation on blur
    - Display inline error messages
    - Prevent invalid form submissions
    - _Requirements: 21.1, 21.5_

  - [~] 19.4 Implement payment error handling
    - Handle payment gateway errors
    - Display specific error messages
    - Preserve cart on payment failure
    - Add retry functionality
    - _Requirements: 4.5, 21.3_

- [ ] 20. Security hardening
  - [~] 20.1 Implement security measures
    - Add CSRF protection
    - Implement rate limiting on API routes
    - Add input sanitization for XSS prevention
    - Ensure HTTPS enforcement
    - Validate all API inputs with Zod
    - _Requirements: 22.1, 22.4, 22.5, 22.6_

  - [ ]* 20.2 Write property tests for security
    - **Property 88: Session tokens are cryptographically secure**
    - **Property 90: User input is sanitized**
    - **Validates: Requirements 22.4, 22.6**

  - [~] 20.3 Add payment security
    - Verify no credit card storage
    - Use Paystack tokenization
    - Implement webhook signature verification
    - _Requirements: 22.3_

  - [ ]* 20.4 Write property test for payment security
    - **Property 87: Credit card data is never stored**
    - **Validates: Requirements 22.3**

- [ ] 21. Accessibility implementation
  - [~] 21.1 Add accessibility features
    - Implement keyboard navigation
    - Add ARIA labels to interactive elements
    - Ensure focus indicators are visible
    - Add alt text to all images
    - Use semantic HTML throughout
    - _Requirements: 24.1, 24.2, 24.3_

  - [ ]* 21.2 Write property test for accessibility
    - **Property 94: Product images have alt text**
    - **Validates: Requirements 24.3**

  - [~] 21.3 Test with accessibility tools
    - Run automated accessibility checks with jest-axe
    - Test keyboard navigation manually
    - Verify screen reader compatibility
    - _Requirements: 24.1, 24.2_

- [ ] 22. Performance optimization
  - [~] 22.1 Implement image optimization
    - Use Next.js Image component throughout
    - Configure Cloudinary transformations
    - Add lazy loading for below-fold images
    - Implement responsive images
    - _Requirements: 17.2, 20.3_

  - [~] 22.2 Add caching strategies
    - Configure ISR for product pages
    - Implement React Query for client-side caching
    - Add database query optimization
    - Set up CDN caching headers
    - _Requirements: 20.4, 20.5_

  - [~] 22.3 Optimize bundle size
    - Implement code splitting
    - Add dynamic imports for heavy components
    - Analyze and reduce bundle size
    - _Requirements: 20.2_

- [ ] 23. Responsive design and mobile optimization
  - [~] 23.1 Implement mobile-responsive layouts
    - Ensure all pages work on mobile devices
    - Add touch-friendly controls
    - Implement swipe gestures for image galleries
    - Test on various screen sizes
    - _Requirements: 15.1, 15.3, 15.4, 15.5_

  - [~] 23.2 Add mobile-specific features
    - Implement hamburger menu with animations
    - Optimize forms for mobile input
    - Add mobile-optimized checkout flow
    - _Requirements: 15.2_

- [ ] 24. Testing and quality assurance
  - [ ]* 24.1 Write integration tests
    - Test complete checkout flow
    - Test admin product creation workflow
    - Test authentication flows
    - Test order status update workflow

  - [ ]* 24.2 Set up E2E tests with Playwright
    - Test critical user journeys
    - Test guest checkout
    - Test authenticated user checkout
    - Test admin workflows

  - [~] 24.3 Configure CI/CD pipeline
    - Set up GitHub Actions or similar
    - Run linting and type checking
    - Run all tests on pull requests
    - Generate coverage reports

- [ ] 25. Final integration and deployment preparation
  - [~] 25.1 Environment configuration
    - Set up production environment variables
    - Configure database connection pooling
    - Set up error monitoring (Sentry)
    - Configure analytics
    - _Requirements: All_

  - [~] 25.2 Database preparation
    - Create production database
    - Run migrations
    - Set up database backups
    - Add database indexes for performance
    - _Requirements: All_

  - [~] 25.3 Final testing and verification
    - Run full test suite
    - Perform manual testing of critical flows
    - Test payment integration in sandbox mode
    - Verify email delivery
    - Test on multiple devices and browsers
    - _Requirements: All_

- [~] 26. Final checkpoint - Production readiness
  - Ensure all tests pass (unit, property, integration, E2E)
  - Verify all features work end-to-end
  - Check performance metrics
  - Verify security measures
  - Confirm accessibility compliance
  - Ask the user if ready for deployment

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests should run minimum 100 iterations
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a bottom-up approach: infrastructure → services → features → UI
- All external service integrations should be mocked in tests
- Database operations should use transactions where appropriate
- Security and accessibility are integrated throughout, not added at the end
