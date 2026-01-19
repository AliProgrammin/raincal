# Stack Research: Cal.com Fork (RainCal)

**Project:** RainCal - Cal.com fork for RainCode accelerator program
**Researched:** 2026-01-19
**Overall confidence:** HIGH

## Executive Summary

Cal.com is a modern, production-ready scheduling infrastructure built with Next.js 16, React 18, and PostgreSQL. The codebase is well-architected for forking, with clear separation of concerns through a monorepo structure. White-labeling is explicitly supported through environment variables and CSS token customization. Calendar sync (Google/Outlook) is built-in via their App Store integrations. Payments can be disabled by not configuring payment providers. The AGPLv3 license requires source code availability to users who interact with your hosted instance.

**Critical insight for RainCal:** Cal.com is designed for exactly this use case. The white-labeling system is production-ready, not a hack.

---

## Core Stack

| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Next.js** | 16.1.0 | Full-stack React framework | Modern App Router, server components, API routes in one framework |
| **React** | 18.2.0 | UI library | Industry standard, component-based architecture |
| **TypeScript** | 5.9.3 | Type system | Type safety across 250k+ LOC monorepo |
| **PostgreSQL** | 13.x+ | Relational database | Robust scheduling/availability queries, ACID compliance |
| **Prisma** | 6.16.1+ | ORM & migrations | Type-safe database access, schema-first design |
| **NextAuth.js** | 4.24.13 | Authentication | OAuth support for Google/Outlook calendar integrations |
| **tRPC** | workspace:* | API layer | End-to-end type safety between client/server |
| **Tailwind CSS** | 4.1.17 | Styling system | Utility-first CSS with design tokens for theming |

### Supporting Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **Tanstack Query** | 5.17.19 | Server state management |
| **React Hook Form** | 7.43.3 | Form handling |
| **Radix UI** | Various | Accessible UI primitives |
| **Jotai** | 2.12.2 | Client state management |
| **Turbo** | 2.5.5 | Monorepo build system |
| **Biome** | 2.3.10 | Linting & formatting |

---

## Self-Hosting Requirements

### Minimum Infrastructure

**Operating System:**
- Linux (recommended for production)
- Also works on: macOS, Windows, BSD
- Docker support available

**Software Dependencies:**
| Requirement | Minimum Version | Notes |
|-------------|-----------------|-------|
| Node.js | 18.x | Version 18 recommended for optimal performance |
| PostgreSQL | 13.x | Primary data store |
| Yarn | 4.12.0 | Package manager (uses Yarn workspaces) |
| Git | Any recent | Source control |

**Hardware:**
- Minimal requirements (lightweight runtime)
- Build process is most resource-intensive
- Production: 2GB RAM minimum, 4GB recommended

### Database Setup

**PostgreSQL is mandatory.** No alternatives supported.

```bash
# After PostgreSQL installation:
# 1. Create database
createdb raincal

# 2. Set DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/raincal"

# 3. Run Prisma migrations
yarn prisma migrate deploy
```

**Connection pooling:** If using a connection pooler (like PgBouncer), set both:
- `DATABASE_URL` - Pooled connection
- `DATABASE_DIRECT_URL` - Direct connection (for migrations)

### Environment Configuration

**Critical environment variables:**

```bash
# Core Application
NEXTAUTH_URL=https://raincal.yourdomain.com
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
CALENDSO_ENCRYPTION_KEY=[32 bytes for AES256]

# Database
DATABASE_URL=postgresql://...

# White-labeling (RainCal specific)
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS="support@raincal.com"
NEXT_PUBLIC_COMPANY_NAME="RainCode Accelerator"

# Calendar Integrations
GOOGLE_API_CREDENTIALS=[OAuth credentials JSON]
GOOGLE_LOGIN_ENABLED=true

# For Outlook/Microsoft:
# Set via Cal.com admin dashboard after deployment
```

**Optional but recommended:**
- Email configuration (SMTP or SendGrid)
- Sentry for error tracking
- PostHog for analytics (can be disabled)

### Build & Deploy

```bash
# 1. Install dependencies
yarn

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Setup database
yarn prisma migrate deploy
yarn prisma generate

# 4. Build for production
yarn build

# 5. Start server
yarn start
```

**Production considerations:**
- Run as a systemd service or Docker container
- Use a reverse proxy (Nginx, Caddy) for HTTPS
- Set up cron jobs for scheduled tasks (reminders, webhooks)
- Database backups (standard PostgreSQL backup strategy)

### Deployment Options

**One-click deploys available:**
- Vercel (easiest for Next.js)
- Railway
- Render
- Google Cloud Platform
- Azure
- Elestio

**Self-hosted servers:**
- VPS (DigitalOcean, Linode, etc.)
- Kubernetes
- Docker Compose

**Recommendation for RainCal:** Start with Vercel or Railway for simplicity. Both handle Next.js optimization and scaling automatically.

---

## White-Labeling / Theming System

Cal.com has production-ready white-labeling support. This is not a hack—it's a documented feature.

### 1. Environment Variables (Brand Identity)

Set these in `.env`:

```bash
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS="support@raincal.com"
NEXT_PUBLIC_COMPANY_NAME="RainCode Accelerator"
```

These control:
- Application name in UI
- Email sender information
- Support contact references

### 2. Logo Replacement

**Location:** `/apps/web/public/`

**Configuration:** `/packages/lib/constants.ts`

```typescript
export const LOGO = "/raincal-logo.svg";
export const LOGO_ICON = "/raincal-icon.svg";
```

**What to replace:**
- Primary logo (used in header, emails)
- Icon logo (used in favicons, small spaces)
- Place your SVG/PNG files in `/apps/web/public/`
- Update constants to point to your files

### 3. Color Theming (Design Tokens)

**Location:** `/apps/web/styles/globals.css`

Cal.com uses a grayscale-first design philosophy with CSS custom properties (design tokens). Colors are defined as RGB values for both light and dark themes.

**Token structure:**
```css
:root {
  --primary: 17 24 39;           /* Main brand color */
  --background: 255 255 255;     /* Light mode background */
  --foreground: 0 0 0;           /* Light mode text */

  /* Semantic colors */
  --success: 34 197 94;
  --warning: 251 146 60;
  --danger: 239 68 68;

  /* Grayscale (1-12) */
  --gray-1: 255 255 255;
  --gray-12: 29 29 29;
}

.dark {
  --background: 29 29 29;        /* Dark mode background */
  --foreground: 255 255 255;     /* Dark mode text */
  /* ... */
}
```

**For RainCal branding:**
1. Choose your brand color palette
2. Convert to RGB values (use hex → RGB converter)
3. Update tokens in `globals.css`
4. Test in both light/dark modes

**Best practice:** Don't add custom CSS files initially. Modify the existing token system first. The design tokens propagate throughout the entire application via Tailwind utilities.

### 4. Custom CSS (Advanced)

**Only if needed:** Create new CSS files in `/apps/web/styles/`

**Import in:** `/apps/web/pages/_app.tsx`

```typescript
import "../styles/raincal-custom.css";
```

**Why avoid this initially:** The token system is comprehensive. Adding custom CSS creates maintenance burden when pulling upstream Cal.com updates.

### White-Labeling Checklist for RainCal

- [ ] Update `.env` with RainCal branding variables
- [ ] Replace logo files in `/apps/web/public/`
- [ ] Update logo constants in `/packages/lib/constants.ts`
- [ ] Customize color tokens in `/apps/web/styles/globals.css`
- [ ] Test light/dark mode appearance
- [ ] Verify email branding (send test booking confirmation)
- [ ] Check all public-facing pages (booking page, confirmation, etc.)

---

## Calendar Integration System

Cal.com uses an "App Store" architecture for integrations. Calendar sync is modular and configurable.

### Architecture

**Integration types:**
- Calendar (Google, Outlook, Apple, CalDAV)
- Video conferencing (Zoom, Google Meet, etc.)
- Payments (Stripe, PayPal, etc.)
- Analytics, CRM, messaging, etc.

**For RainCal, we need:**
- Google Calendar (students/advisors may use Gmail)
- Outlook/Microsoft 365 (university may use Microsoft)

### Google Calendar Setup

**Required:**
1. Google Cloud Project with Calendar API enabled
2. OAuth 2.0 credentials (Web application)
3. Authorized redirect URIs configured

**Environment variables:**
```bash
GOOGLE_API_CREDENTIALS='{"web":{"client_id":"...","client_secret":"..."}}'
GOOGLE_LOGIN_ENABLED=true
```

**User flow:**
1. User navigates to Cal.com → Settings → Calendar
2. Clicks "Connect Google Calendar"
3. OAuth flow authenticates
4. Cal.com reads/writes calendar events for availability

**Permissions needed:**
- Read calendar events (for availability checks)
- Write calendar events (for creating bookings)

### Outlook/Microsoft 365 Setup

**Required:**
1. Microsoft Azure AD app registration
2. Calendar API permissions (Calendars.ReadWrite)
3. Webhook configuration for real-time sync

**Environment variables:**
```bash
MICROSOFT_WEBHOOK_TOKEN=[random secret]
MICROSOFT_WEBHOOK_URL=[your domain]/api/integrations/microsoft/webhook
```

**User flow:**
- Similar to Google: Settings → Calendar → Connect Outlook
- Uses Microsoft OAuth

### How It Works

**Two-way sync:**
1. **Reading availability:** Cal.com queries connected calendars to find free slots
2. **Creating bookings:** Cal.com writes events to connected calendars when booking confirmed
3. **Conflict prevention:** Cross-references all connected calendars before showing availability

**Webhook-based updates:**
- Real-time notifications when calendar events change
- Keeps Cal.com's availability cache fresh
- No polling required

**For RainCal use case:**
- CTO advisors connect their Google/Outlook calendars
- Students book meetings as guests (no calendar connection needed)
- System automatically checks advisor availability
- Creates calendar event on advisor's calendar when booked

### Recommendation

**Phase 1:** Google Calendar only (likely most common for advisors)
**Phase 2:** Add Outlook if university uses Microsoft 365

Both integrations are stable, well-documented, and widely used in production Cal.com instances.

---

## Payment System (Disabling for RainCal)

### Cal.com's Payment Architecture

**Supported providers:**
- Stripe (primary, most integrated)
- PayPal (via App Store)

**Integration depth:**
- Per-event-type payment configuration
- One-time payments or subscriptions
- Webhook handling for payment status

### How to Disable Payments

**Simple: Don't configure payment providers.**

Payments in Cal.com are **opt-in per event type**, not system-wide. If you don't:
1. Install Stripe/PayPal apps from App Store
2. Configure payment environment variables
3. Enable payments on individual event types

Then payments are not available. No code changes needed.

**Environment variables to omit:**
```bash
# Leave these unset:
STRIPE_PRIVATE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CLIENT_ID
# etc.
```

**In the UI:**
- Event type settings will not show payment options
- Booking flow has no payment step
- No payment-related database tables are used

### If You Need to Remove Payment UI Completely

**Not recommended initially.** But if you want to strip payment code:

1. **Remove Stripe app from monorepo:**
   - `/packages/app-store/stripepayment/`

2. **Remove payment-related components:**
   - Search codebase for `stripe`, `payment`, `paypal`
   - Remove UI components conditionally rendered for payments

**Trade-off:** Makes future upgrades from upstream Cal.com harder. Only do this if payment UI presence is confusing for users.

**Recommendation for RainCal:** Simply don't configure payments. The UI gracefully hides payment options when not configured.

---

## Key Dependencies Deep Dive

### Prisma (Database ORM)

**Why it matters:**
- Schema is defined in `/packages/prisma/schema.prisma`
- Database migrations live in `/packages/prisma/migrations/`
- Forking means you own schema evolution

**For RainCal:**
- Likely won't need schema changes initially
- If adding custom fields (e.g., "student ID"), modify schema and generate migration
- Follow Prisma's migration workflow to avoid breaking database

**Commands:**
```bash
# Generate client after schema changes
yarn prisma generate

# Create migration
yarn prisma migrate dev --name add_student_id

# Apply migrations in production
yarn prisma migrate deploy
```

### tRPC (API Layer)

**Why it matters:**
- All server-client communication uses tRPC
- Type-safe RPC calls (no REST/GraphQL boilerplate)
- Routers defined in `/packages/trpc/server/routers/`

**For RainCal:**
- Unlikely to need new API endpoints initially
- If building custom features (e.g., "advisor analytics"), add tRPC routers
- Type safety means refactoring is safe (TypeScript will catch breaks)

### NextAuth.js (Authentication)

**Why it matters:**
- Handles user sessions, OAuth flows
- Required for calendar integrations (OAuth with Google/Microsoft)
- Session management, JWT tokens, database session storage

**For RainCal:**
- Works out of box for advisor login
- Guest booking (students) doesn't require authentication
- Calendar OAuth flows depend on NextAuth

**Critical:** `NEXTAUTH_SECRET` must be set and kept secret. Used for JWT signing.

### Tailwind CSS 4.x (Styling)

**Why it matters:**
- Major version (4.x) released recently
- Cal.com is on the latest version
- Design token system built on Tailwind's CSS variables

**For RainCal:**
- Theming via tokens (described earlier) is the recommended approach
- Avoid writing custom CSS; use Tailwind utilities
- Reference Cal.com's design system at design.cal.com

---

## Monorepo Structure

Cal.com is a Turborepo monorepo with workspaces:

```
/apps
  /web          - Main Next.js application
  /api          - API v2 (separate service)

/packages
  /prisma       - Database schema & migrations
  /trpc         - API layer
  /features     - Feature packages
  /ui           - Shared UI components
  /lib          - Utilities
  /app-store    - Integration apps
  /ee           - Enterprise Edition (commercial license)
```

### What This Means for Forking

**Good:**
- Clean separation of concerns
- Shared code in packages
- Easy to understand module boundaries

**Caution:**
- Don't modify `/packages/features/ee` unless you understand commercial licensing
- Changes to `/packages/*` affect multiple apps
- Turborepo builds are cached (sometimes need to clear cache)

**Build commands:**
```bash
# Build everything
yarn build

# Build specific app
yarn workspace @calcom/web build

# Clear cache if things are weird
yarn turbo clean
```

---

## Recommendations for RainCal

### Stack Decisions

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| **Fork vs. Deploy vanilla** | Fork | White-labeling requires code changes (logo, colors) |
| **Database** | PostgreSQL 15+ | Cal.com requires it; use recent stable version |
| **Hosting** | Vercel or Railway | Simplest for Next.js; handles scaling automatically |
| **Node version** | 18.x LTS | Cal.com tested on 18; 20.x likely works but verify |
| **Package manager** | Yarn 4 | Required by monorepo setup |

### What NOT to Change

**Do not modify:**
1. **Core scheduling logic** (`/packages/features/bookings`)
   - Complex, well-tested
   - Breaking it breaks everything

2. **Prisma schema** (initially)
   - Unless you need custom fields
   - Schema changes require careful migration strategy

3. **Authentication system**
   - NextAuth is deeply integrated
   - Calendar OAuth depends on it

4. **Payment code** (if not using payments)
   - Leave it in place, just don't configure
   - Easier for future upstream merges

### What to Change

**Safe to customize:**
1. **Environment variables** (`.env`)
2. **Logo files** (`/apps/web/public`)
3. **Color tokens** (`/apps/web/styles/globals.css`)
4. **Constants** (`/packages/lib/constants.ts`)
5. **Copy/text** (strings throughout codebase, if needed)

### Upstream Merge Strategy

**Challenge:** Cal.com is actively developed. How to get bug fixes and features?

**Strategy:**
1. **Keep fork minimal:** Only change what's necessary for branding
2. **Track upstream:** Add Cal.com repo as remote
   ```bash
   git remote add upstream https://github.com/calcom/cal.com.git
   git fetch upstream
   ```
3. **Cherry-pick or rebase:** Periodically merge upstream changes
4. **Test thoroughly:** After merging upstream, test booking flow end-to-end

**Reality check:** Merging upstream can be painful if you've made extensive changes. Minimize custom code.

### Phase Recommendations

**Phase 1: Get it running**
- Fork repo
- Update `.env` with RainCal branding
- Deploy to Vercel/Railway
- Test booking flow

**Phase 2: Branding**
- Replace logos
- Customize color tokens
- Test light/dark modes

**Phase 3: Integrations**
- Set up Google Calendar OAuth
- Add Outlook if needed
- Test calendar sync

**Phase 4: Production**
- Custom domain
- Email configuration (SMTP)
- Monitoring (Sentry)
- Backup strategy

---

## Licensing Considerations

### AGPLv3 Requirements

Cal.com is licensed under **AGPLv3** (except `/packages/features/ee` which is commercial).

**What this means for RainCal:**

1. **Source code must be available:** If you host RainCal and users interact with it over a network, you must provide source code to those users.

2. **Modifications must be shared:** Any changes you make to Cal.com code must be released under AGPLv3.

3. **Commercial use is allowed:** You can use it for a university program without licensing fees.

4. **Private use is fine:** If you host it privately (only for RainCode students/advisors), you must provide source to those users, but not the general public.

### Compliance Strategy

**Option 1: Public repository (recommended)**
- Host RainCal code in a public GitHub repo
- Satisfies AGPLv3 source availability requirement
- Easy for audit/transparency

**Option 2: Source code download link**
- Provide a link on RainCal site to download source
- Complies with AGPLv3
- More friction

**Option 3: Commercial license**
- Contact Cal.com for pricing
- Removes AGPLv3 obligations
- Likely unnecessary for a university program

**Recommendation:** Public GitHub repo. It's the easiest and aligns with open-source values.

### Enterprise Edition Code

**Do not use code in `/packages/features/ee` unless:**
- You understand the commercial license terms
- You've confirmed it's needed (unlikely for RainCal)

**Most likely:** You don't need EE features. Core Cal.com is fully functional.

---

## Known Limitations & Gotchas

### 1. Build Performance

**Issue:** Initial build can take 5-10 minutes on limited hardware.

**Mitigation:**
- Use hosted platforms (Vercel, Railway) which have powerful build servers
- If self-hosting, allocate sufficient CPU for builds

### 2. Database Migrations

**Issue:** Prisma migrations can fail if database schema diverged.

**Mitigation:**
- Always back up database before migrations
- Test migrations in staging first
- Read migration files before applying

### 3. Calendar Sync Delays

**Issue:** Availability updates can lag by a few seconds.

**Mitigation:**
- This is expected (webhook-based sync has latency)
- Encourage advisors to update calendars well before meetings
- Users can manually refresh availability

### 4. Email Configuration

**Issue:** Many hosting providers block port 25 (SMTP).

**Mitigation:**
- Use SendGrid, Mailgun, or similar service
- Configure SMTP settings in `.env`
- Test email delivery early

### 5. Cron Jobs

**Issue:** Some features (reminders, webhooks) need scheduled tasks.

**Mitigation:**
- Vercel: Use Vercel Cron
- Railway: Use Railway Cron
- Self-hosted: Set up system cron or use a cron service

---

## Quick Start Checklist

For RainCal team to get started:

- [ ] Fork Cal.com repository to RainCode GitHub org
- [ ] Clone fork locally
- [ ] Install Node 18, Yarn, PostgreSQL
- [ ] Copy `.env.example` to `.env`
- [ ] Set `DATABASE_URL` to local PostgreSQL
- [ ] Generate `NEXTAUTH_SECRET` and `CALENDSO_ENCRYPTION_KEY`
- [ ] Run `yarn` to install dependencies
- [ ] Run `yarn prisma migrate deploy` to setup database
- [ ] Run `yarn dev` to start development server
- [ ] Test booking flow at localhost:3000
- [ ] Update branding (logos, colors, env vars)
- [ ] Set up Google Calendar OAuth
- [ ] Deploy to Vercel/Railway
- [ ] Configure custom domain
- [ ] Test end-to-end booking with real calendars
- [ ] Set up monitoring (Sentry, PostHog)
- [ ] Document deployment process for team

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Core stack** | HIGH | Verified from official package.json and GitHub repo |
| **Self-hosting requirements** | HIGH | Official documentation + community guides |
| **Theming system** | HIGH | Official white-labeling docs + source code |
| **Calendar integrations** | HIGH | Documented in Cal.com docs + App Store |
| **Payment disabling** | MEDIUM | Logic inferred from architecture; not explicitly documented |
| **Licensing** | HIGH | Official Cal.com blog post + GitHub LICENSE file |

---

## Sources

**Official Documentation:**
- [Cal.com GitHub Repository](https://github.com/calcom/cal.com)
- [Cal.com Self-Hosting Installation Guide](https://cal.com/docs/self-hosting/installation)
- [Cal.com White-Labeling Guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction)
- [Cal.com Custom CSS Guide](https://cal.com/docs/self-hosting/guides/white-labeling/custom-css)
- [Cal.com Design System - Colors](https://design.cal.com/basics/colors)
- [Cal.com Outlook Calendar Integration](https://cal.com/docs/platform/atoms/outlook-calendar-connect)

**GitHub Sources:**
- [package.json (apps/web)](https://github.com/calcom/cal.com/blob/main/apps/web/package.json)
- [.env.example](https://github.com/calcom/cal.com/blob/main/.env.example)
- [LICENSE](https://github.com/calcom/cal.com/blob/main/LICENSE)

**Community & Blog Posts:**
- [Cal.com Blog: Changing to AGPLv3 and Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition)
- [Cal.com Blog: Self-Hosted Scheduling Guide](https://cal.com/blog/transitioning-from-cloud-to-self-hosted-scheduling-a-step-by-step-guide)
- [How to Self-Host Cal.com on Ubuntu (2025)](https://dev.to/therealfloatdev/how-to-self-host-calcom-on-ubuntu-with-monitoring-1ph9)

**Related Resources:**
- [Top Open-Source Calendly Alternatives 2025](https://www.houseoffoss.com/post/top-3-open-source-alternatives-to-calendly-in-2025-cal-com-easy-appointments-and-croodle)
- [Cal.com Features Overview](https://cal.com/blog/what-type-of-customization-options-does-cal-com-offer)

---

## Next Steps

This stack research provides the foundation for roadmap creation. Key implications:

1. **Phase structure should be linear:** Fork → Brand → Deploy → Integrate
2. **No deep research needed:** Cal.com is well-documented and production-ready
3. **Focus on configuration, not code changes:** White-labeling is built-in
4. **Calendar sync is table stakes:** Google Calendar in Phase 1, Outlook in Phase 2 if needed

Research complete. Ready for roadmap creation.
