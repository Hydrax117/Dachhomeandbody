# Dachhomeandbody - Luxury E-Commerce Platform

A sophisticated e-commerce platform for premium fragrances and body care products, built with Next.js 16, TypeScript, and modern web technologies.

## 🌟 Features

- **Luxury Design**: Cinematic, minimal aesthetics inspired by Byredo, Le Labo, and Aesop
- **Mobile-First**: Responsive design optimized for all devices
- **Authentication**: Secure auth with NextAuth.js (credentials + OAuth)
- **Product Catalog**: Advanced filtering, search, and fragrance profiles
- **Shopping Cart**: Persistent cart with coupon support
- **Checkout**: Guest and authenticated checkout with payment integration
- **Admin Dashboard**: Complete product, order, and customer management
- **Reviews & Ratings**: Customer reviews with moderation
- **Wishlist**: Save products for later
- **Analytics**: Sales trends and business insights

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: TailwindCSS v4 with custom design tokens
- **Animations**: Framer Motion
- **Validation**: Zod
- **Payments**: Paystack & Flutterwave
- **Images**: Cloudinary
- **Email**: Resend

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🛠️ Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database URL and other credentials.

3. **Set up database**
   ```bash
   # Run migrations
   npm run db:migrate

   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## 🗂️ Project Structure

```
dachhomeandbody/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (shop)/            # Customer-facing routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── product/          # Product-related components
│   └── cart/             # Cart components
├── lib/                   # Utilities and helpers
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth configuration
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── public/               # Static assets
└── .kiro/specs/          # Project specifications
```

## 🎨 Design System

The platform uses a luxury design system with:

- **Colors**: Minimal palette (black, white, warm taupe)
- **Typography**: Geist Sans with refined letter spacing
- **Spacing**: Generous, spacious scale
- **Animations**: Smooth, elegant transitions

See `app/globals.css` for the complete design token system.

## 🔐 Default Credentials

After seeding the database:

**Admin Account**
- Email: `admin@dachhomeandbody.com`
- Password: `admin123`

**Test Customer**
- Email: `customer@example.com`
- Password: `customer123`

**⚠️ Change these credentials in production!**

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Tasks](./.kiro/specs/dachhomeandbody-ecommerce/tasks.md) - Implementation plan
- [Requirements](./.kiro/specs/dachhomeandbody-ecommerce/requirements.md) - Feature requirements
- [Design](./.kiro/specs/dachhomeandbody-ecommerce/design.md) - Architecture and design

## 🧪 Testing

```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
```

## 🚢 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

For other platforms, see [SETUP.md](./SETUP.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contribution guidelines before submitting PRs.

## 📧 Support

For support, email support@dachhomeandbody.com or open an issue on GitHub.

---

Built with ❤️ using Next.js 16
