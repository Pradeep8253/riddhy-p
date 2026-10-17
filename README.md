# RF | RIDDHY — Furniture & Home Appliances

<div align="center">

**Thoughtful choices for a home that feels like you.**  
*रिद्धि फर्नीचर · आपके घर की समृद्धि*

A premium, modern Indian e-commerce platform crafted with **Next.js 16 App Router**, **React 19**, **Redux Toolkit**, **Mongoose**, **Vanilla CSS Modules**, and **Lucide Icons**.

[Explore Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Environment](#-environment-variables) • [Project Structure](#-project-structure)

</div>

---

## 🌟 Key Features

### 🛍️ Store Experience
- **Curated Catalog**: Handcrafted wooden furniture, modern living essentials, and dependable home appliances with verified Indian home dimensions.
- **Shop The Look (Interactive Hotspots)**: High-resolution room staging with smart auto-positioning hotspot pins that adapt above or below viewport boundaries.
- **Product Dimension Diagrams**: Architectural SVG diagrams for lift and entryway clearances before purchase.
- **Dynamic Swatches**: Real-time finish and fabric preview on product detail pages.
- **Side-by-Side Product Comparison**: Compare dimensions, materials, capacities, and warranty terms up to 4 items simultaneously.
- **Direct WhatsApp Concierge**: Instant customer service & product inquiry integration with official brand vector icons across header, footer, and floating triggers.
- **Hour Deals & Offers**: Time-sensitive seasonal promotions and bundled room packages.

### 🔒 Auth-Guarded Commerce
- **Strict Customer Login Guards**:
  - **Bookmarking (Wishlist)**: Unauthenticated users are politely prompted with a luxury toast notification and guided to `/account` with an automatic return redirect.
  - **Add to Bag**: Adding items to the shopping cart requires customer sign-in. Guests are redirected to log in and automatically returned to the exact product they wanted.
- **Persistent State Sync**: Redux Toolkit state synchronized across local storage and authenticated server sessions.
- **Smart Return Redirection**: Once a user logs in or registers, they are seamlessly redirected back to the exact product or collection they were viewing.
- **Flexible Auth**: Support for Email + Password, Google OAuth 2.0, and 6-digit OTP email password recovery.

### 💳 Checkout & Order Processing
- **Server-Verified Pricing**: Live real-time quote generation calculating items subtotal, GST/taxes, delivery charges, installation fees, and coupon discounts.
- **Pincode Serviceability**: Instant check for local delivery schedules, COD eligibility, and installation availability.
- **Dual Payment Options**:
  - **Razorpay Online Payments**: Integrated support for UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Netbanking with HMAC-SHA256 signature verification.
  - **Cash on Delivery (COD)**: Automated pincode and cart value rules with server-verified reservation locks.
- **Stock Reservation**: 20-minute stock holding locks to avoid inventory collision during checkout.

### 👤 Customer Account & Aftercare Hub
- **Orders & Tracking**: Complete order history with detailed status tracking and printable GST invoices.
- **Warranty Registration**: Register products for manufacturer and seller warranties with serial number tracking.
- **Service & Return Claims**: Lodge service claims and returns with optional signed photo/video upload capabilities.
- **Free Home Consultation**: Booking scheduler for custom interior sizing and appliance fitting advice.

### 🛡️ Admin Management Portal (`/admin`)
- **Secure Role Protection**: Protected administrator session management with session timeout safeguards.
- **Product Catalog Management**: Create and update furniture and appliance products, SKUs, specifications, pricing, and stock status.
- **Order Fulfillment Pipeline**: Complete lifecycle controls (`Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`).
- **Warranty Claim Review**: Manage warranty validations, customer claims, and replacement approvals with fallback mock data when database is offline.
- **Coupon & Campaign Engine**: Create percentage or fixed discount coupons with start/end dates, minimum cart thresholds, and maximum discount caps.
- **Customer & Bulk Enquiry Inbox**: View customer queries and trade quotation requests.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Modern React Server Components, server actions, route handlers, and streaming |
| **UI Library** | **React 19.2** | Concurrent rendering, modern hooks, and optimized state management |
| **State Management** | **Redux Toolkit** | Centralized client state for Cart, Wishlist, Compare, UI, and Auth sessions |
| **Styling** | **Vanilla CSS Modules** | Zero-runtime CSS Modules with cohesive HSL tokens (Forest Green, Warm Ivory, Brass Gold) |
| **Icons** | **Lucide React** | Crisp, lightweight, accessible SVG vector icon system |
| **Motion & Dynamics** | **GSAP & Lenis** | Smooth momentum scrolling and micro-animations |
| **Database** | **MongoDB & Mongoose** | Flexible document modeling with transactions and connection caching |
| **Authentication** | **Jose & Bcrypt.js** | Stateless `httpOnly` JWT session cookies (`rf_session`) with 7-day expiry |
| **Validation** | **Zod** | Schema validation for forms, checkout quotes, and API requests |
| **Payments** | **Razorpay Node SDK** | Checkout orders, webhook listening, and payment signature verification |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20.9.0 or higher (Node 22 recommended)
- **MongoDB**: Local replica set or MongoDB Atlas (transactions required for checkout reservations)
- **npm**: v10+

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Pradeep8253/riddhy-p.git
cd riddhy-pradeep

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` or `.env` file in the root directory:

```env
# Database connection
MONGODB_URI=mongodb://127.0.0.1:27017/rf-riddhy?replicaSet=rs0
MONGODB_DB=rf-riddhy

# Auth & Security
JWT_SECRET=your-secure-random-secret-key-at-least-32-chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Razorpay (Optional for testing online payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Cloudinary (Optional for warranty uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

---

## 📁 Project Structure

```
riddhy-pradeep/
├── app/                              # Next.js App Router root
│   ├── (store)/                      # Storefront route group
│   │   ├── appliances/               # Appliances catalog
│   │   ├── cart/                     # Shopping bag page
│   │   ├── checkout/                 # Secure checkout flow
│   │   ├── compare/                  # Product comparison
│   │   ├── furniture/                # Furniture catalog
│   │   ├── product/[slug]/           # Product detail page
│   │   └── wishlist/                 # Curated saved pieces
│   ├── account/                      # Customer portal (Sign-in / Dashboard)
│   ├── admin/                        # Admin portal (/admin, /admin/products, etc.)
│   ├── api/                          # REST API route handlers
│   │   ├── auth/                     # Session, login, register, OAuth, OTP
│   │   ├── admin/                    # Admin mutations & analytics
│   │   ├── cart/                     # Cart synchronization
│   │   ├── checkout/                 # Quotes and reservations
│   │   ├── payments/                 # Razorpay order create & verification
│   │   └── me/                       # Customer profile, orders, warranties
│   ├── layout.js                     # Root storefront layout
│   └── page.js                       # Homepage with hero, hotspots & collections
├── components/                       # Modular React components
│   ├── admin/                        # Admin dashboard UI, tables & shells
│   ├── commerce/                     # AuthForm, CartClient, CheckoutClient, etc.
│   ├── providers/                    # StoreProvider (Redux + Session sync)
│   ├── store/                        # Header, Footer, Hotspots, ProductRail
│   └── ui/                           # Button, Icon (Lucide), ProductCard, Modal
├── lib/                              # Utility libraries & services
│   ├── auth.js                       # JWT sign, verify, and session management
│   ├── db.js                         # Mongoose connection manager with cache
│   ├── demo-data.js                  # Curated catalog data & offline fallback
│   ├── razorpay.js                   # Payment gateway utilities
│   └── pricing.js                    # Cart calculations and fee estimators
├── models/                           # Mongoose data schemas
│   ├── User.js                       # Customers and administrators
│   ├── Product.js                    # Catalog items, variants & specs
│   ├── Order.js                      # Placed orders & status logs
│   ├── Warranty.js                   # Registered customer warranties
│   └── Coupon.js                     # Promo codes & discount rules
├── store/                            # Redux Toolkit state slices
│   ├── authSlice.js                  # User authentication state
│   ├── cartSlice.js                  # Cart items & quantities
│   ├── wishlistSlice.js              # Wishlist bookmarks
│   ├── compareSlice.js               # Comparison items
│   ├── uiSlice.js                    # Locale, toast alerts, drawer status
│   └── store.js                      # Root store configuration
└── public/                           # Static assets & photography
```

---

## 🔑 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/auth/session` | Get current customer session status | No |
| `POST` | `/api/auth/login` | Authenticate customer credentials | No |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/products` | Query products by category, room or query | No |
| `POST` | `/api/checkout/quote` | Generate server-calculated price quote | No |
| `POST` | `/api/checkout/reservations` | Reserve stock & create order intent | Yes |
| `POST` | `/api/payments/create-order`| Generate Razorpay order ID | Yes |
| `POST` | `/api/payments/verify` | Verify Razorpay payment signature | Yes |
| `GET` | `/api/me/orders` | Customer's past orders | Customer |
| `GET` | `/api/me/warranties` | Customer's registered warranties | Customer |
| `GET` | `/api/admin/orders` | Full order management list | Admin |
| `GET` | `/api/admin/warranty` | Warranty claims & review list | Admin |

---

## 🎨 Design System & Aesthetics

- **Color Palette**:
  - `Forest Deep` (`#1b2e23`): Anchor brand tone symbolizing longevity and natural wood.
  - `Leaf Green` (`#2e7d32`): Primary action tone for trust and seamless transactions.
  - `Warm Ivory` (`#faf8f5` / `#f3eee6`): Architectural canvas that feels calm and welcoming.
  - `Brass Gold` (`#c5a059`): Subtle luxury accents for verified badges and ratings.
- **Typography**: Clean, readable sans-serif system with high contrast and legible line heights for specifications.
- **Vector Icons**: Comprehensive integration of **Lucide React** vector icons, replacing legacy unicode symbols across all interactive buttons, badges, arrows, and ratings.

---

## 🚢 Production Deployment

### Vercel (Recommended)
1. Import repository into [Vercel](https://vercel.com).
2. Configure all environment variables from `.env.example` in project settings.
3. Use a hosted MongoDB database (such as MongoDB Atlas) with replica set support enabled.
4. Set Razorpay webhook target to `https://your-domain.com/api/webhooks/razorpay`.

### Docker
The repository includes a ready-to-run `Dockerfile` and `docker-compose.yml`:
```bash
docker compose up --build -d
```

---

<div align="center">
  <sub>Built with care for Indian homes · RF Riddhy Furniture & Home Appliances</sub>
</div>
