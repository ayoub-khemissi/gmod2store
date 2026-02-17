# s&box Store

Marketplace for s&box creators and players. Discover, sell, and buy gamemodes, tools, maps, weapons, entities, and UI assets for Source 2.

## Tech Stack

- **Framework** — Next.js 15 (App Router, Turbopack)
- **UI** — HeroUI v2, Tailwind CSS v4, Framer Motion
- **Database** — MySQL 8+ (mysql2)
- **Auth** — Steam OpenID 2.0 (cookie-based sessions)
- **Payments** — Stripe (Checkout, Webhooks, platform fee split)
- **Language** — TypeScript 5

## Features

- **Steam Authentication** — Sign in via Steam OpenID, server-side session management
- **Product Catalog** — Browse, search (full-text), filter by category, staff picks
- **Creator Dashboard** — Publish products, manage versions/images, track sales & revenue, export data
- **Storefront Pages** — Product detail with image gallery, reviews (1-5 stars), creator profiles
- **Purchases & Licensing** — Stripe Checkout, automatic license key generation, download library
- **License Verification API** — REST API (`/api/v1/license/verify`) with API key auth for in-game verification
- **Support Tickets** — Threaded conversations, escalation, admin resolution
- **Notifications** — In-app notification system
- **Guard Pipeline** — AI-powered product review (static analysis, content check, quality scoring)
- **Admin Panel** — User management, product approval/rejection, ticket & contact oversight
- **Contact Form** — Public contact page with admin management
- **Dark/Light Theme** — Toggle via next-themes

## Project Structure

```
app/
  (store)/          # Public storefront (browse, product detail)
  (auth)/           # Login page
  (dashboard)/      # Creator dashboard, library, tickets, API keys
  (admin)/          # Admin panel
  api/
    auth/           # Steam login, callback, logout, /me
    products/       # Catalog & search
    creator/        # Creator CRUD (products, images, versions, stats, sales)
    checkout/       # Stripe Checkout session
    webhooks/       # Stripe webhook handler
    library/        # User purchases & downloads
    tickets/        # Support ticket system
    notifications/  # User notifications
    uploads/        # Image & archive uploads
    admin/          # Admin endpoints (users, products, tickets, guard, contacts)
    v1/             # Public API (license verification, API keys)
components/         # Reusable UI components
lib/                # Core utilities (db, auth, steam, api helpers)
services/           # Business logic layer
migrations/         # SQL schema migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- A [Steam API Key](https://steamcommunity.com/dev/apikey)
- A [Stripe](https://dashboard.stripe.com) account (for payments)

### Installation

```bash
pnpm install
```

### Environment

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `STEAM_API_KEY` | Steam Web API key |
| `SESSION_SECRET` | Random secret for sessions |
| `SESSION_TTL` | Session duration in seconds (default: `86400`) |
| `UPLOAD_DIR` | Local upload directory (default: `./uploads`) |
| `UPLOAD_MAX_SIZE` | Max upload size in bytes (default: `500MB`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PLATFORM_FEE_PERCENT` | Platform fee percentage (default: `10`) |
| `AI_API_KEY` | API key for AI guard pipeline |
| `AI_MODEL` | Model to use for guard reviews |
| `NEXT_PUBLIC_APP_URL` | Public URL (default: `http://localhost:3000`) |

### Database Setup

Create the database and run migrations:

```bash
mysql -u root -e "CREATE DATABASE gmod2store"
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Production

```bash
pnpm build
pnpm start
```

## License Verification API

Creators can verify licenses from their s&box gamemodes/addons:

```
GET /api/v1/license/verify?license_key=XXXX&steam_id=76561198000000000
Authorization: Bearer <api_key>
```

Response:

```json
{
  "valid": true,
  "license": {
    "product_id": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

API keys are managed from the dashboard under **API Keys**.
