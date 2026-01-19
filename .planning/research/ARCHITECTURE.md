# Architecture Research: Cal.com

**Project:** RainCal (Cal.com fork for university accelerator)
**Researched:** 2026-01-19
**Confidence:** HIGH (based on official documentation, GitHub repository, and handbook)

## Executive Summary

Cal.com is built as a **Turborepo monorepo** using Next.js, TypeScript, Prisma ORM, and PostgreSQL. For RainCal's customization needs (branding, custom admin dashboard), the architecture provides clear modification points:

- **Safe customization**: Environment variables, `globals.css` theming, and vertical slices in `packages/features/`
- **Main app**: `apps/web` contains the primary scheduling application
- **Database**: Prisma schema at `packages/prisma/schema.prisma` with User, Team, EventType, Booking models
- **2026 direction**: Vertical Slice Architecture with domain-driven organization enforced via linting

**For RainCal specifically**: Custom branding goes in environment variables + `globals.css`, admin features should be built as new vertical slices in `packages/features/`, avoid modifying core booking/scheduling logic to preserve upgrade paths.

---

## Monorepo Structure

Cal.com uses **Turborepo** to manage their monorepo containing both open-source and private code. The build system uses `turbo.json` for pipeline definitions and caching optimization.

### Top-Level Directories

```
cal.com/
├── apps/              # Deployable applications (Next.js)
│   ├── web/           # Main scheduling app (app.cal.com)
│   ├── website/       # Marketing site (cal.com)
│   ├── api/           # Public API (api.cal.com)
│   ├── swagger/       # OpenAPI specification
│   └── docs/          # Documentation site
├── packages/          # Shared libraries (non-deployed)
│   ├── prisma/        # Database schema and ORM
│   ├── features/      # Vertical slice features (NEW 2026)
│   ├── ui/            # @calcom/ui component library
│   └── [other libs]/  # Utilities, types, configs
├── agents/            # AI agents for scheduling automation
├── deploy/            # Infrastructure-as-code
├── scripts/           # Build and maintenance scripts
└── .github/           # CI/CD workflows
```

**Key distinction**: `apps/` are deployed webapps, `packages/` are shared libraries consumed locally via workspace references (e.g., `"@calcom/ui": "*"`).

---

## Key Applications

### apps/web (Primary Application)

The main scheduling application deployed at app.cal.com.

**Directory structure:**
```
apps/web/
├── app/              # Next.js App Router (routing and layouts)
├── pages/            # Legacy Next.js Pages Router
├── components/       # React components
├── modules/          # Feature-specific modules
├── lib/              # Client-side utilities
├── server/lib/       # Server-side utilities
├── styles/           # CSS and styling files (THEMING HERE)
│   └── globals.css   # Instance-wide color tokens
├── public/           # Static assets (logos, images)
├── playwright/       # E2E tests
└── next.config.ts    # Next.js configuration
```

**Technology stack:**
- Next.js (React framework)
- tRPC for type-safe API layer
- Tailwind CSS for styling
- TypeScript throughout

**tRPC patterns**: Path before `useQuery`/`useMutation` represents actual procedure location (e.g., `packages/trpc/server/routers/viewer/webhook`). Each handler has a corresponding `name.schema.ts` for validation.

### apps/api

Public API service deployed at api.cal.com. API v1 is being **deprecated February 28, 2026** — migrate to API v2 for improved performance and expanded endpoints.

### apps/website

Marketing and landing pages at cal.com (separate from the scheduling app).

---

## Theming System (Critical for RainCal)

Cal.com offers **instance-wide theming** using color tokens for consistent branding.

### Primary Theming Location

**File:** `apps/web/styles/globals.css`

**How it works:**
- Uses CSS custom properties (variables) for all colors
- Supports both light and dark themes
- Changes propagate across entire application instantly

**Example structure:**
```css
:root {
  --cal-bg-emphasis: #HEXCODE;
  --cal-bg: #HEXCODE;
  --cal-bg-subtle: #HEXCODE;
  --cal-bg-info: #HEXCODE;
  --cal-bg-error: #HEXCODE;
  /* ... more color tokens */
}

.dark {
  --cal-bg-emphasis: #HEXCODE;
  /* ... dark mode overrides */
}
```

**To customize for RainCal:**
1. Open `apps/web/styles/globals.css`
2. Replace hex codes with raincode.tech brand colors
3. Rebuild application (`yarn build`)
4. Changes apply instance-wide

### Environment Variable Branding

**Key variables** (in `.env` file):

```bash
# App Identity
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_COMPANY_NAME="Raincode University Accelerator"

# URLs
NEXT_PUBLIC_WEBAPP_URL="https://raincal.yourdomain.edu"
NEXT_PUBLIC_WEBSITE_URL="https://raincal.yourdomain.edu"
NEXT_PUBLIC_WEBSITE_TERMS_URL="https://..."
NEXT_PUBLIC_WEBSITE_PRIVACY_POLICY_URL="https://..."

# License
NEXT_PUBLIC_LICENSE_CONSENT=true

# Debugging (dev only)
NEXT_PUBLIC_DEBUG=1
NEXT_PUBLIC_LOGGER_LEVEL=3
```

**Static assets** (logos):
- Place custom logo in `apps/web/public/`
- Reference in components or replace default Cal.com logo files

### User-Level Customization (Preserved)

Cal.com also supports per-user branding in the UI:
- Users can set brand colors for light/dark themes
- Team plan allows disabling Cal.com branding
- Event embeds can have custom colors per event

**For RainCal**: Instance-wide theming handles university branding, individual users (CTOs) could still customize their booking pages if desired.

---

## Database Schema (Prisma)

**Location:** `packages/prisma/schema.prisma`

**Database:** PostgreSQL 13+
**ORM:** Prisma (v6.16+ supports Rust-free, ESM-first client generator)

### Key Models for RainCal Use Case

#### User Model
Core user accounts (admins, CTOs in RainCal context).

**Key fields:**
- `email`, `username`, `password` (BCrypt encrypted)
- `role` (determines permissions)
- `timezone`, `locale`
- `metadata` (JSON field for custom data)
- Relationships: `teams`, `credentials`, `bookings`, `schedules`

#### Team Model
Represents both teams and organizations (via `parentId`).

**Key fields:**
- `name`, `slug`
- `parentId` (for organization hierarchy)
- `logo`, `brandColor` (team-level branding)
- Relationships: `members` (via Membership), `eventTypes`

**For RainCal**: Could model "CTO groups" as teams, or use Organization features for university structure.

#### Membership Model
Junction table connecting Users to Teams with roles.

**Roles:**
- `OWNER` (full control)
- `ADMIN` (manage team settings)
- `MEMBER` (basic access)

**Utility functions:**
- `isTeamAdmin(userId, teamId)` — returns membership if ADMIN/OWNER
- `isTeamOwner(userId, teamId)` — boolean for OWNER specifically
- `isTeamMember(userId, teamId)` — boolean for any accepted membership

#### EventType Model
Defines bookable event types (CTO availability slots in RainCal).

**Key fields:**
- `title`, `slug`, `description`, `duration`
- `locations` (JSON array of meeting locations)
- `price`, `currency` (if payment required)
- `schedulingType` (ROUND_ROBIN, COLLECTIVE, MANAGED)
- `requiresConfirmation` (manual approval)
- Relationships: `owner` (User), `team`, `hosts`, `schedule`

**For RainCal**: CTOs would create EventTypes for their availability.

#### Schedule Model
User-specific availability windows.

**Key fields:**
- `name`, `timezone`
- Relationships: `availability` (time slots), `user`

#### Availability Model
Specific time windows for availability.

**Key fields:**
- `days` (array of weekday numbers)
- `startTime`, `endTime` (time of day)
- `date` (for date-specific overrides)

#### Booking Model
Scheduled meetings/appointments.

**Key fields:**
- `uid`, `title`, `description`
- `startTime`, `endTime`
- `status` (ACCEPTED, CANCELLED, PENDING, etc.)
- `metadata` (JSON for custom data)
- Relationships: `user`, `attendees`, `eventType`

**For RainCal**: Students booking CTO sessions would create Booking records.

#### Attendee Model
Individual participants in bookings (guest students in RainCal).

**Key fields:**
- `email`, `name`, `timezone`
- `timeZone`, `locale`
- Relationships: `booking`

**For RainCal**: Guest booking means creating Attendee records without requiring User accounts.

### Database Considerations

**Audit trail**: `AuditActor` model preserves audit history even after user/attendee deletion (no foreign key constraints by design).

**Organization features**: `Profile` model allows users to have multiple profiles across organizations (enterprise feature).

**Migrations**:
- Development: `yarn workspace @calcom/prisma db-migrate` (may clear dev DB)
- Production: `yarn workspace @calcom/prisma db-deploy`

---

## Vertical Slice Architecture (2026+)

Cal.com is transitioning to **strict Vertical Slice Architecture** with Domain-Driven Design principles.

### packages/features/ Structure

**Core principle**: Each folder is a self-contained vertical slice containing all domain logic, services, components, and tests.

**Benefits:**
1. **Domain organization**: All booking logic in `packages/features/bookings/`, availability logic in `packages/features/availability/`, etc.
2. **Enforced boundaries**: Linting prevents reaching into feature internals — cross-feature dependencies must use public APIs
3. **Testability**: Test entire feature as a unit with all pieces co-located
4. **Clarity**: New features start as new folders, making it obvious what's being built

**For RainCal custom features:**
- Create new vertical slice: `packages/features/raincal-admin/` for custom admin dashboard
- Structure:
  ```
  packages/features/raincal-admin/
  ├── components/      # React components for admin UI
  ├── lib/             # Business logic
  ├── api/             # tRPC routers/procedures
  ├── types/           # TypeScript types
  └── index.ts         # Public API exports
  ```
- Import only through public API: `import { AdminDashboard } from "@calcom/features/raincal-admin"`

### Engineering Teams & Review Process

**Foundation Team**: Enforces architectural patterns and coding standards in PR reviews.

**Linting enforcement**: Automated checks prevent violations of domain boundaries (e.g., `packages/features/bookings` cannot import from `packages/features/availability/services/internal`).

---

## Safe Customization Points

Areas where RainCal can safely modify without breaking upgrade paths.

### 1. Environment Variables (.env)
**Risk: LOW** — Configuration-based, no code changes.

**Customizations:**
- App name, company name, URLs
- Feature flags (e.g., `NEXT_PUBLIC_DISABLE_SIGNUP=true`)
- API keys for integrations
- Logging levels

**Upgrade impact:** Minimal — check `.env.example` for new variables after upgrades.

### 2. Instance-Wide Theming (globals.css)
**Risk: LOW to MEDIUM** — Single file, well-defined.

**Customizations:**
- Brand colors (hex values)
- Light/dark theme colors
- Component-level color tokens

**Upgrade impact:** Possible merge conflicts if Cal.com changes color token names. Mitigation: Document custom hex values, reapply after upgrade.

### 3. Static Assets (public/)
**Risk: LOW** — File additions, no code changes.

**Customizations:**
- Logo replacement
- Favicon
- Custom images

**Upgrade impact:** None (files are additions, not modifications).

### 4. Custom Features (packages/features/)
**Risk: MEDIUM** — New code, but isolated.

**Customizations:**
- New admin dashboard in `packages/features/raincal-admin/`
- Custom integrations in `packages/features/raincal-integrations/`
- CTO management UI in `packages/features/raincal-cto-mgmt/`

**Upgrade impact:** Low if following vertical slice pattern. Features are self-contained and don't modify core code. Risk: Dependencies on internal Cal.com APIs that may change.

**Best practice:**
1. Use only public Cal.com APIs/exports
2. Avoid importing from `/internal` paths
3. Document external dependencies
4. Test thoroughly after upgrades

### 5. Database Schema Extensions
**Risk: MEDIUM to HIGH** — Schema changes affect data integrity.

**Customizations:**
- Add custom fields to existing models (via Prisma `extend`)
- Create new models for RainCal-specific data (e.g., `UniversityMeta`)

**Upgrade impact:** High risk of migration conflicts. Cal.com's migrations may conflict with custom schema changes.

**Best practice:**
1. Extend models rather than modify them
2. Use `metadata` JSON fields on existing models when possible
3. Create separate tables for RainCal-specific data with foreign keys
4. Namespace custom migrations clearly (e.g., `raincal_`)
5. Back up database before every upgrade

### 6. API Extensions (apps/api)
**Risk: MEDIUM** — Custom endpoints alongside official API.

**Customizations:**
- Custom tRPC procedures for RainCal admin functions
- New REST endpoints (if needed)

**Upgrade impact:** Medium — conflicts if Cal.com changes API structure.

**Best practice:**
1. Add custom routers under `/raincal/` namespace
2. Import Cal.com utilities rather than duplicating
3. Document all custom endpoints

---

## Risky Areas (Avoid Modification)

Areas that will cause significant upgrade pain or breakage.

### 1. Core Booking Logic
**Location:** `packages/features/bookings/`

**Why risky:** Heavily tested, complex business logic. Changes here break scheduling functionality and conflict with nearly every upgrade.

**For RainCal:** Use booking logic as-is. If custom behavior needed, wrap it in custom feature rather than modifying core.

### 2. Core Event Type Management
**Location:** `packages/features/eventtypes/`

**Why risky:** Central to Cal.com's value proposition. Frequent updates.

**For RainCal:** Extend via hooks/plugins if available, don't modify directly.

### 3. Database Core Models
**Specifically:** User, Booking, EventType, Attendee core fields

**Why risky:** Schema migrations from Cal.com will conflict with modifications. Data integrity issues.

**For RainCal:** Add fields via metadata JSON or create related tables, don't alter core fields.

### 4. Authentication/Authorization Core
**Location:** NextAuth configuration, session management

**Why risky:** Security-critical, frequent patches.

**For RainCal:** Use Cal.com's auth system. If custom auth needed (e.g., university SSO), integrate via OAuth providers rather than replacing core.

### 5. Next.js Configuration
**File:** `apps/web/next.config.ts`

**Why risky:** Build system changes can break deployments.

**For RainCal:** Add minimal configuration (e.g., custom headers). Avoid modifying existing settings.

### 6. Turborepo Configuration
**File:** `turbo.json`

**Why risky:** Affects entire monorepo build pipeline.

**For RainCal:** Don't modify unless absolutely necessary. If adding custom packages, follow existing patterns exactly.

---

## Upgrade Path Strategy

Maintaining a fork with custom changes requires discipline.

### Recommended Approach

**1. Branch Strategy:**
- `upstream/main` — tracks Cal.com official repo
- `raincal/main` — production branch with customizations
- `raincal/dev` — development and integration branch

**2. Regular Sync Process:**
```bash
# 1. Fetch upstream changes
git fetch upstream

# 2. Create upgrade branch
git checkout -b upgrade/YYYY-MM-DD raincal/dev

# 3. Merge upstream
git merge upstream/main

# 4. Resolve conflicts (prioritize custom code in safe zones)

# 5. Test thoroughly
yarn
yarn workspace @calcom/prisma db-migrate-dev
yarn build
yarn test

# 6. Deploy to staging, then production
```

**3. Conflict Resolution Priority:**
- **Environment variables**: Keep RainCal values, add new upstream variables
- **globals.css**: Keep RainCal colors, adopt new token names if changed
- **Custom features**: Keep unchanged (shouldn't conflict)
- **Core code**: Prefer upstream changes unless breaking for RainCal

**4. Testing Checklist Post-Upgrade:**
- [ ] Branding appears correctly (logo, colors)
- [ ] Admin users can log in
- [ ] CTOs can set availability
- [ ] Guest booking flow works
- [ ] Custom admin dashboard loads (if built)
- [ ] Database migrations applied successfully
- [ ] No console errors in browser/server

### Upgrade Frequency

**Recommendation:** Quarterly major upgrades, monthly security patches.

**Rationale:**
- Too frequent: Constant merge conflicts, testing overhead
- Too infrequent: Massive conflicts, missing security patches

**Exception:** Security vulnerabilities require immediate upgrade regardless of schedule.

---

## Build and Deployment

### Development

```bash
# 1. Install dependencies
yarn

# 2. Set up environment
cp .env.example .env
# Edit .env with RainCal-specific values

# 3. Database setup (with test data)
yarn dx  # Auto-provisions local PostgreSQL

# Alternative: Manual database setup
yarn workspace @calcom/prisma db-migrate-dev

# 4. Start dev server
yarn dev
# Access at http://localhost:3000
```

### Production

```bash
# 1. Install dependencies
yarn

# 2. Configure environment
# Set production .env values (database URL, secrets, etc.)

# 3. Apply migrations
yarn workspace @calcom/prisma db-deploy

# 4. Build
yarn build

# 5. Start
yarn start
```

### Docker Deployment

Cal.com provides official Docker images at `calcom/cal.com`. For RainCal fork:

**Option A: Build custom Docker image**
- Fork Dockerfile, apply customizations
- Build: `docker build -t raincal:latest .`
- Deploy with docker-compose

**Option B: Environment-only customization**
- Use official image
- Override via environment variables and mounted volumes (globals.css, public assets)

**Infrastructure requirements:**
- 4+ CPU cores
- 8+ GB RAM
- SSD storage
- PostgreSQL 13+ database
- Cron jobs for scheduled tasks (reminders, webhooks)

---

## Architecture Patterns

### Domain-Driven Design (DDD)

Cal.com organizes by domain, not technical layer.

**Traditional (avoid):**
```
src/
├── controllers/
├── services/
├── repositories/
└── utilities/
```

**Cal.com approach (follow):**
```
packages/features/
├── bookings/      # All booking domain logic
├── availability/  # All availability domain logic
└── raincal-admin/ # RainCal custom admin domain
```

### tRPC Type-Safe APIs

**Pattern:**
1. Define schema: `packages/trpc/server/routers/viewer/feature/name.schema.ts`
2. Implement procedure: `packages/trpc/server/routers/viewer/feature/name.handler.ts`
3. Export from router: `packages/trpc/server/routers/viewer/feature/index.ts`
4. Use in client: `trpc.viewer.feature.name.useQuery()`

**For RainCal custom APIs:**
```typescript
// packages/trpc/server/routers/viewer/raincal/
import { z } from "zod";
import { authedProcedure } from "../../procedures";

export const raincalAdminRouter = {
  getCtoStats: authedProcedure
    .input(z.object({ ctoId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Custom admin logic
    }),
};
```

### Component Architecture

**UI Library:** `packages/ui/` contains shared components (buttons, forms, modals).

**Usage pattern:**
```typescript
import { Button, Form, Modal } from "@calcom/ui";
```

**For RainCal custom components:**
- Reuse `@calcom/ui` components for consistency
- Create custom components in `packages/features/raincal-*/components/`
- Avoid duplicating existing UI components

---

## Anti-Patterns to Avoid

### 1. Modifying Core Files Directly
**Bad:** Editing `packages/features/bookings/lib/handleBooking.ts`
**Good:** Creating `packages/features/raincal-bookings/` wrapper that uses core booking logic

### 2. Tight Coupling to Internals
**Bad:** `import { internalFunction } from "@calcom/features/bookings/services/internal"`
**Good:** `import { publicAPI } from "@calcom/features/bookings"`

### 3. Duplicating Core Logic
**Bad:** Copying booking logic to modify behavior
**Good:** Extending via composition or configuration

### 4. Hardcoding Configuration
**Bad:** `const COMPANY_NAME = "RainCal"` in code
**Good:** `process.env.NEXT_PUBLIC_COMPANY_NAME` from environment

### 5. Schema Modifications Without Namespace
**Bad:** Adding `ctoMetadata` field to core User model
**Good:** Using User.metadata JSON field or creating `RaincalUserMeta` table

### 6. Ignoring Linting Errors
**Bad:** `// eslint-disable-next-line`
**Good:** Understanding and fixing the architectural violation

---

## RainCal-Specific Recommendations

Based on the use case (university accelerator, admin adds CTOs, students book as guests):

### Phase 1: Branding
**Safe modifications:**
1. Update `.env` with RainCal-specific variables
2. Customize `apps/web/styles/globals.css` with raincode.tech colors
3. Replace logo in `apps/web/public/`
4. Set `NEXT_PUBLIC_DISABLE_SIGNUP=true` (admin-only user creation)

**Risk: LOW** — No code changes, easy to maintain.

### Phase 2: Role Management
**Use existing Cal.com features:**
1. Create "Organization" for university accelerator
2. Assign ADMIN role to staff managing platform
3. Add CTOs as MEMBER or ADMIN (depending on autonomy needed)
4. Use Membership model and RBAC utilities (`isTeamAdmin`, etc.)

**Custom code (if needed):**
- Create `packages/features/raincal-roles/` for custom permission logic
- Extend User metadata for university-specific attributes

**Risk: MEDIUM** — Minimal custom code, mostly configuration.

### Phase 3: Guest Booking
**Use existing Cal.com features:**
- Cal.com supports guest bookings out-of-box
- Attendee records created without User accounts
- Email notifications to guests

**Custom code (if needed):**
- Custom booking form fields in EventType metadata
- Post-booking webhooks for university systems integration

**Risk: LOW** — Core feature, no modification needed.

### Phase 4: Admin Dashboard (Future)
**Approach:**
1. Create `packages/features/raincal-admin/` vertical slice
2. Build custom tRPC procedures for stats/metrics
3. Create admin UI in `apps/web/pages/raincal-admin/` or `apps/web/app/raincal-admin/`
4. Query Booking, User, Attendee models via Prisma

**Risk: MEDIUM** — Custom code, but isolated. Test thoroughly after Cal.com upgrades.

---

## Sources

### Official Documentation
- [Cal.com Monorepo/Turborepo Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo)
- [Cal.com Instance-Wide Theming](https://cal.com/docs/enterprise-features/instance-wide-theming)
- [Cal.com Self-Hosting Upgrading](https://cal.com/docs/self-hosting/upgrading)
- [Cal.com Installation Docs](https://cal.com/docs/self-hosting/installation)
- [Cal.com Contributor's Guide](https://cal.com/docs/developing/open-source-contribution/contributors-guide)

### GitHub Repository
- [Cal.com GitHub](https://github.com/calcom/cal.com)
- [Prisma Schema](https://github.com/calcom/cal.com/blob/main/packages/prisma/schema.prisma)
- [Environment Variables Example](https://github.com/calcom/cal.com/blob/main/.env.example)

### Blog Posts & Announcements
- [Engineering in 2026 and Beyond](https://cal.com/blog/engineering-in-2026-and-beyond)
- [Role-Based Access Control](https://cal.com/blog/role-based-access-control)
- [Customization Options](https://cal.com/blog/what-type-of-customization-options-does-cal-com-offer)

### API & Design
- [Cal.com Design System](https://design.cal.com/)
- [API v2 Documentation](https://cal.com/docs/api-reference/v2/)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Monorepo Structure | HIGH | Verified from official handbook and GitHub repository |
| Theming System | HIGH | Official documentation with code examples |
| Database Schema | HIGH | Direct inspection of Prisma schema file on GitHub |
| Vertical Slice Architecture | HIGH | Official 2026 engineering blog post |
| Safe Customization Points | MEDIUM | Inferred from best practices and upgrade docs; practical experience would increase confidence |
| Upgrade Path | MEDIUM | Based on official upgrade docs; real-world fork maintenance may encounter edge cases |

---

## Next Steps for RainCal

**Recommended phase structure based on architecture research:**

1. **Phase 0: Setup & Branding** (Low risk, foundational)
   - Fork repository, set up CI/CD
   - Apply branding customizations
   - Configure environment for self-hosting

2. **Phase 1: User Management** (Leverage existing features)
   - Create admin accounts
   - Establish CTO onboarding process
   - Test RBAC and permissions

3. **Phase 2: Core Booking Flow** (No modification needed)
   - Validate guest booking works as-is
   - Configure email notifications
   - Test end-to-end CTO availability → student booking

4. **Phase 3: Custom Admin Dashboard** (Medium complexity, isolated)
   - Create vertical slice for admin features
   - Build metrics/reporting UI
   - Integrate with Prisma for data queries

5. **Phase 4: Production Deployment** (Infrastructure)
   - Self-hosted deployment setup
   - Database backup/restore procedures
   - Monitoring and alerting

**Architecture supports this phasing**: Early phases use configuration only (safe), later phases add isolated custom features (manageable upgrades).
