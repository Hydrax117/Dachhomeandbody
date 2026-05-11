# Dachhomeandbody E-Commerce Platform - Setup Guide

## Project Setup Status

### ✅ Completed
1. **Next.js 14+ with TypeScript and App Router** - Initialized
2. **TailwindCSS v4** - Configured with luxury design tokens
3. **Prisma Schema** - Complete database models defined
4. **Dependencies Installed**:
   - next-auth (v5 beta) for authentication
   - bcryptjs for password hashing
   - zod for validation
   - framer-motion for animations
   - prisma for database ORM
5. **TypeScript** - Strict mode enabled
6. **ESLint** - Configured with Next.js config
7. **Prettier** - Configured with project standards
8. **Environment Variables** - Structure created

### 🔄 Requires User Action

#### 1. Database Setup

You need to set up a PostgreSQL database. Choose one of these options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Then update .env with your connection string:
DATABASE_URL="postgresql://username:password@localhost:5432/dachhomeandbody?schema=public"
```

**Option B: Cloud Database (Recommended)**
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

After setting up, update the `DATABASE_URL` in `.env` file.

#### 2. Run Database Migration

Once your database is configured:

```bash
# Generate Prisma Client and run migrations
npx prisma migrate dev --name init

# Verify database connection
npx prisma studio
```

#### 3. Generate NextAuth Secret

```bash
# Generate a secure secret for NextAuth
openssl rand -base64 32
```

Update `NEXTAUTH_SECRET` in `.env` with the generated value.

#### 4. Optional: Configure External Services

Update these in `.env` as needed:

- **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com)
- **Paystack**: Get keys from [Paystack Dashboard](https://dashboard.paystack.com)
- **Cloudinary**: Get credentials from [Cloudinary Console](https://cloudinary.com/console)
- **Resend**: Get API key from [Resend Dashboard](https://resend.com)

## Luxury Design Tokens

The TailwindCSS configuration includes luxury design tokens inspired by Byredo, Le Labo, and Aesop:

### Colors
- Primary: `#1a1a1a` (Deep black)
- Secondary: `#f5f5f5` (Soft white)
- Accent: `#8b7355` (Warm taupe)
- Muted: `#6b6b6b` (Sophisticated gray)

### Typography
- Font family: Geist Sans (modern, clean)
- Letter spacing: Refined scale for luxury feel
- Line heights: Optimized for readability

### Spacing
- Generous, spacious scale (xs to 3xl)
- Designed for breathing room and elegance

### Transitions
- Fast: 150ms
- Base: 250ms
- Slow: 350ms

## Next Steps

1. **Set up database** (see above)
2. **Run migrations**: `npx prisma migrate dev --name init`
3. **Start development server**: `npm run dev`
4. **Access the app**: http://localhost:3000
5. **View database**: `npx prisma studio`

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio              # Open Prisma Studio
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema without migration

# Formatting
npx prettier --write .         # Format all files
```

## Project Structure

```
dachhomeandbody/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles with design tokens
├── prisma/
│   └── schema.prisma      # Database schema
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config (strict mode)
├── .prettierrc            # Prettier config
└── eslint.config.mjs      # ESLint config
```

## Important Notes

### Next.js 16 Changes
This project uses Next.js 16, which has breaking changes from previous versions:
- Check `node_modules/next/dist/docs/` for current documentation
- Server Actions are the recommended way to handle mutations
- App Router is the default routing system

### Database Schema
The Prisma schema includes all models from the design document:
- User (with roles: CUSTOMER, ADMIN)
- Product (with fragrance profiles)
- Order (with guest checkout support)
- Review (with moderation)
- Coupon (with validation rules)
- Category, Address, WishlistItem, CartItem

### Security
- Passwords are hashed with bcryptjs
- Environment variables are in .gitignore
- TypeScript strict mode is enabled
- NextAuth handles session management

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists
- Check firewall/network settings

### Migration Errors
```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### TypeScript Errors
```bash
# Regenerate Prisma Client
npx prisma generate
```

## Ready to Continue?

Once the database is set up and migrations are run, you're ready to proceed with:
- Task 2: Authentication system implementation
- Task 3: Database access layer and core services
- Task 4: External service integrations

Refer to `.kiro/specs/dachhomeandbody-ecommerce/tasks.md` for the complete implementation plan.
