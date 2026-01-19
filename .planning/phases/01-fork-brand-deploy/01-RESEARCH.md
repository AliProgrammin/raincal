# Phase 1: Fork, Brand, and Deploy - Research

**Researched:** 2026-01-19
**Domain:** Cal.com (Next.js scheduling platform)
**Confidence:** HIGH

## Summary

Cal.com is an open-source scheduling infrastructure platform licensed under AGPLv3, built as a Next.js monorepo using Turborepo. The repository is actively maintained (39,747+ stars, 11,591 forks as of Jan 2026) and designed for self-hosting with comprehensive white-labeling capabilities.

The standard approach for forking Cal.com involves: (1) forking the main repository, (2) setting up local development with Node.js 18 + PostgreSQL 13+, (3) customizing branding through environment variables and specific files in `/packages/lib/constants.ts` and `apps/web/styles/globals.css`, and (4) deploying as a standard Next.js application to platforms like Vercel, Railway, or custom servers.

Key considerations: AGPLv3 license requires making modified source code available to users who interact with the software over a network. The platform requires minimal resources to run but has intensive build requirements. White-labeling is straightforward for self-hosted instances through environment variables and CSS modifications.

**Primary recommendation:** Fork the repository, use `yarn dx` for rapid local setup with Docker, configure environment variables for branding, and deploy to a Next.js-compatible platform with PostgreSQL database.

## Standard Stack

The established libraries/tools for Cal.com:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 18.x | Runtime environment | Required for optimal performance and compatibility |
| PostgreSQL | 13.x+ | Primary database | Official requirement, used by Prisma ORM |
| Yarn | Latest | Package manager | Monorepo workspace management |
| Next.js | Latest (built-in) | Web framework | Core framework Cal.com is built on |
| Prisma | Latest (dependency) | ORM & migrations | Database schema management |
| Turborepo | Latest (dependency) | Monorepo build system | Manages build caching and pipelines |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Docker | Latest | Local development | Quick setup via `yarn dx` command |
| Docker Compose | Latest | Database orchestration | Required for `yarn dx` quick start |
| OpenSSL | Any | Secret generation | Generating NEXTAUTH_SECRET and encryption keys |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL | MySQL/other | Not officially supported; Prisma schema expects PostgreSQL |
| Yarn | npm/pnpm | Monorepo workspace configuration expects Yarn |
| Docker setup | Manual PostgreSQL | More control but slower initial setup |

**Installation:**
```bash
# Fork repository at https://github.com/calcom/cal.com/fork
git clone https://github.com/YOUR_USERNAME/cal.com.git
cd cal.com
yarn
yarn dx  # Quick start with Docker (includes PostgreSQL + test users)
```

**Windows-specific installation:**
```bash
# Requires admin privileges and symbolic link support
git clone -c core.symlinks=true https://github.com/YOUR_USERNAME/cal.com.git
```

## Architecture Patterns

### Recommended Project Structure
Cal.com uses a Turborepo monorepo structure:

```
cal.com/
├── apps/                    # Deployable applications
│   ├── web/                # Main webapp (app.cal.com)
│   ├── website/            # Marketing site (cal.com)
│   ├── api/                # API v1
│   ├── api-v2/             # API v2 (requires Redis)
│   └── ai/                 # Cal.ai features
├── packages/               # Shared libraries and utilities
│   ├── lib/                # Core utilities
│   ├── ui/                 # UI components
│   ├── features/           # Feature modules
│   │   └── ee/             # Enterprise Edition (commercial license)
│   ├── prisma/             # Database schema and migrations
│   └── [other packages]/   # Various shared packages
├── docs/                   # Documentation
├── scripts/                # Automation tools
├── .env.example            # Environment variable template
└── turbo.json              # Turborepo build pipeline config
```

### Pattern 1: Monorepo Package References
**What:** Local packages are referenced using workspace protocol
**When to use:** Importing shared code between apps and packages
**Example:**
```json
// In any package.json within the monorepo
{
  "dependencies": {
    "@calcom/ui": "*",  // Asterisk for local workspace packages
    "react": "^18.0.0"  // Standard semver for npm packages
  }
}
```
Source: [Cal.com Monorepo Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo)

### Pattern 2: Environment-Based Configuration
**What:** Configuration through `.env` file with required and optional variables
**When to use:** All deployments (development, staging, production)
**Example:**
```bash
# Source: Cal.com official documentation
# Required core variables
DATABASE_URL="postgresql://user:pass@host:port/dbname"
NEXTAUTH_SECRET="generated-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"  # or your production URL

# White-labeling variables
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS="[email protected]"
NEXT_PUBLIC_COMPANY_NAME="RainCal Inc."
```
Source: [Cal.com .env.example](https://github.com/calcom/cal.com/blob/main/.env.example)

### Pattern 3: White-Labeling Approach
**What:** Multi-layer branding customization
**When to use:** Self-hosted instances requiring custom branding
**Layers:**
1. Environment variables (app name, support email, company name)
2. Logo files in `/web/public` + constants in `/packages/lib/constants.ts`
3. Color tokens in `apps/web/styles/globals.css` for theme

**Example:**
```typescript
// /packages/lib/constants.ts
export const LOGO = "/your-logo.svg";  // Path from /web/public
export const LOGO_ICON = "/your-icon.svg";
```
Source: [Cal.com White Labeling Guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction)

### Pattern 4: Database Migration Strategy
**What:** Prisma-based schema deployment
**When to use:** Initial setup and after pulling upstream changes
**Example:**
```bash
# Deploy migrations to database
yarn workspace @calcom/prisma db-deploy

# Or use quick start (handles this automatically)
yarn dx
```
Source: [Cal.com Local Development Docs](https://cal.com/docs/developing/local-development)

### Anti-Patterns to Avoid
- **Building without database connection:** The build process requires an active database connection; attempting to build without DATABASE_URL will fail
- **Ignoring DATABASE_DIRECT_URL:** When using connection poolers like PgBouncer, you must set both DATABASE_URL and DATABASE_DIRECT_URL
- **Skipping production build test:** Always run `yarn build` before committing to ensure production builds succeed
- **Modifying `/packages/features/ee/` without license:** Enterprise Edition folder is under commercial license, not AGPLv3

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secret generation | Random string generators | `openssl rand -base64 32` | Cal.com expects cryptographically secure 32-byte secrets for NEXTAUTH_SECRET |
| Encryption keys | Custom key generation | `openssl rand -base64 24` | CALENDSO_ENCRYPTION_KEY must be exactly 24 bytes for AES256 |
| Database setup | Manual PostgreSQL install | `yarn dx` with Docker | Includes database, test users, and proper configuration |
| Email testing | External SMTP setup | E2E_TEST_MAILHOG_ENABLED=1 | Built-in Mailhog for local email testing |
| Calendar integrations | Custom OAuth flows | Cal.com's app store system | Pre-built integrations with proper scopes and refresh logic |
| URL generation | Manual URL construction | NEXT_PUBLIC_WEBAPP_URL env var | Cal.com uses this throughout the app for consistent URL generation |

**Key insight:** Cal.com is a production-grade monorepo with complex build pipelines and database requirements. The quick-start tooling (`yarn dx`) handles edge cases that manual setup would miss. Custom solutions for core infrastructure (secrets, database, email) will conflict with the platform's assumptions.

## Common Pitfalls

### Pitfall 1: License Compliance Misunderstanding
**What goes wrong:** Forking Cal.com without understanding AGPLv3 requirements, leading to license violations
**Why it happens:** AGPLv3 is less common than MIT/Apache; network copyleft is often overlooked
**How to avoid:**
- Understand AGPLv3 Section 13: If you modify the code and host it on a server, you must make your modified source code available to users
- Keep your fork public on GitHub or provide a download link in your app
- Only the `/packages/features/ee/` folder is under commercial license (1% of codebase)
- If modifications are made to AGPLv3 code, source must be offered to network users
**Warning signs:** Planning a private fork, removing "View Source" links, or hesitation about sharing code

### Pitfall 2: Environment Variable Misconfiguration
**What goes wrong:** Application fails to start, authentication breaks, or URLs point to localhost in production
**Why it happens:** Cal.com has many environment variables; some are required, some are optional, and documentation is spread across multiple files
**How to avoid:**
- Always start by copying `.env.example` to `.env`
- Generate secrets properly: `openssl rand -base64 32` for NEXTAUTH_SECRET
- Set NEXTAUTH_URL to your actual domain (not localhost) in production
- For Vercel preview deployments, leave NEXTAUTH_URL, NEXT_PUBLIC_WEBSITE_URL, and NEXT_PUBLIC_WEBAPP_URL empty
- Understand DATABASE_DIRECT_URL is only needed with connection poolers
**Warning signs:** 404 errors, "stuck on localhost:3000" in production, authentication redirect loops

### Pitfall 3: Build-Time Database Requirement
**What goes wrong:** Build process fails with database connection errors
**Why it happens:** Unlike typical Next.js apps, Cal.com requires database access during build (Prisma client generation)
**How to avoid:**
- Ensure DATABASE_URL is set before running `yarn build`
- For Docker deployments, database must be available during image build
- Don't use placeholder values for DATABASE_URL
- Complete database migrations before building: `yarn workspace @calcom/prisma db-deploy`
**Warning signs:** Build fails with Prisma connection errors, "database unavailable" during build

### Pitfall 4: Incomplete Branding Customization
**What goes wrong:** Some Cal.com branding remains visible after attempting white-labeling
**Why it happens:** Branding is split across multiple locations (env vars, constants, CSS, logo files)
**How to avoid:**
- Update ALL branding layers:
  1. Environment variables: NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS, NEXT_PUBLIC_COMPANY_NAME
  2. Logo constants: LOGO and LOGO_ICON in `/packages/lib/constants.ts`
  3. Logo files: Replace files in `/web/public`
  4. Color theme: Modify color tokens in `apps/web/styles/globals.css`
- Rebuild after branding changes: `yarn build`
**Warning signs:** "Cal.com" still appears in emails, default logos on booking pages, original color scheme persists

### Pitfall 5: Upstream Sync Complexity
**What goes wrong:** Difficulty merging upstream Cal.com updates into your fork
**Why it happens:** Cal.com is rapidly developed; conflicts accumulate if fork diverges significantly
**How to avoid:**
- Keep customizations minimal and isolated
- Use environment variables and CSS for branding (not code modifications)
- Regularly fetch and merge upstream: `git fetch upstream && git merge upstream/main`
- Document all code modifications separately
- Consider using Git submodules or separate override layer instead of direct modifications
**Warning signs:** Hundreds of merge conflicts, outdated dependencies, missing security updates

### Pitfall 6: Missing Cron Jobs
**What goes wrong:** Scheduled features (reminders, cleanup tasks) don't execute
**Why it happens:** Cal.com requires external cron job configuration that isn't automatic
**How to avoid:**
- Check `/apps/web/app/api/cron` for required cron endpoints
- Configure platform-specific cron:
  - Vercel: Set up via Vercel Cron
  - Custom server: Set up system cron jobs to hit cron endpoints
- Document which features require cron jobs
**Warning signs:** Reminder emails not sent, stale data in database, cleanup tasks not running

### Pitfall 7: Docker Support Assumptions
**What goes wrong:** Expecting official Docker support and encountering issues
**Why it happens:** Cal.com's README states "Docker support is community-powered, not officially supported"
**How to avoid:**
- Understand Docker resources are maintained by community
- Test Docker deployments thoroughly before production
- Have fallback plan for manual deployment
- Monitor Cal.com Docker discussions for known issues
- Consider Railway, Render, or Vercel as officially documented alternatives
**Warning signs:** Docker-specific bugs without official fixes, outdated Docker images

## Code Examples

Verified patterns from official sources:

### Quick Development Setup
```bash
# Source: https://cal.com/docs/developing/local-development
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cal.com.git
cd cal.com

# Install dependencies
yarn

# Quick start with Docker (recommended for beginners)
# Requires Docker and Docker Compose installed
yarn dx
# This starts PostgreSQL and seeds test users
# Credentials are logged to console

# Application runs at http://localhost:3000
```

### Manual Development Setup
```bash
# Source: https://cal.com/docs/developing/local-development
# After cloning and yarn install

# 1. Copy environment template
cp .env.example .env

# 2. Generate secrets
openssl rand -base64 32  # Copy to NEXTAUTH_SECRET
openssl rand -base64 24  # Copy to CALENDSO_ENCRYPTION_KEY

# 3. Configure .env manually
# Set DATABASE_URL to your PostgreSQL instance
# Example: postgresql://postgres:password@localhost:5432/calendso

# 4. Deploy database schema
yarn workspace @calcom/prisma db-deploy

# 5. Start development server
yarn dev
```

### Production Build
```bash
# Source: https://github.com/calcom/cal.com/blob/main/CONTRIBUTING.md
# Always test production build before committing changes

# 1. Ensure database is running and DATABASE_URL is set
# 2. Run production build
yarn build

# 3. Start production server
yarn start

# The build must complete without errors
```

### White-Labeling Configuration
```bash
# Source: https://cal.com/docs/self-hosting/guides/white-labeling/introduction
# In your .env file

# Application branding
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS="[email protected]"
NEXT_PUBLIC_COMPANY_NAME="RainCal Inc."

# Base URLs (set to your domain in production)
NEXTAUTH_URL="https://raincal.com"
NEXT_PUBLIC_WEBAPP_URL="https://raincal.com"
NEXT_PUBLIC_WEBSITE_URL="https://raincal.com"
```

### Logo Customization
```typescript
// Source: https://cal.com/docs/self-hosting/guides/white-labeling/introduction
// File: /packages/lib/constants.ts

// Update these constants to point to your logo files
// Logo files should be placed in /web/public/
export const LOGO = "/raincal-logo.svg";
export const LOGO_ICON = "/raincal-icon.svg";
```

### Theme Customization
```css
/* Source: https://cal.com/docs/self-hosting/guides/white-labeling/introduction */
/* File: apps/web/styles/globals.css */

/* Modify color tokens for consistent branding */
/* Example: Change primary brand color */
:root {
  --cal-brand: #your-hex-color;
  --cal-brand-emphasis: #your-emphasis-color;
  --cal-brand-text: #your-text-color;
  /* Continue with other color tokens as needed */
}
```

### Database Configuration
```bash
# Source: https://cal.com/docs/self-hosting/installation
# PostgreSQL connection string format

# Standard configuration
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# With connection pooler (e.g., PgBouncer)
DATABASE_URL="postgresql://username:password@pooler_hostname:6432/database_name"
DATABASE_DIRECT_URL="postgresql://username:password@direct_hostname:5432/database_name"
```

### Deployment to Vercel
```bash
# Source: https://cal.com/docs/self-hosting/installation
# Note: Vercel Pro Plan required due to serverless function limits

# 1. Connect GitHub repository to Vercel
# 2. Configure environment variables in Vercel dashboard:
#    - DATABASE_URL (PostgreSQL connection string)
#    - NEXTAUTH_SECRET (generated with openssl)
#    - CALENDSO_ENCRYPTION_KEY (generated with openssl)
#    - Branding variables (NEXT_PUBLIC_APP_NAME, etc.)
# 3. For preview deployments, leave these EMPTY:
#    - NEXTAUTH_URL
#    - NEXT_PUBLIC_WEBSITE_URL
#    - NEXT_PUBLIC_WEBAPP_URL
# 4. Deploy
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual database setup | `yarn dx` with Docker | Documented as of 2023+ | Faster onboarding; test users included |
| Individual `.env` management | `.env.example` template | Standard practice | Clearer required variables |
| Lerna-only monorepo | Turborepo with Lerna | Migration complete | Faster builds with caching |
| Enterprise features mixed | `/packages/features/ee/` separation | License change to AGPLv3 | Clear license boundaries |
| Single API | API v1 + API v2 | API v2 introduced 2024+ | v2 requires Redis; more features |

**Deprecated/outdated:**
- **CALENDSO branding:** Original name before rebranding to Cal.com; CALENDSO_ENCRYPTION_KEY env var retains old naming
- **Node.js < 18:** Older versions no longer recommended; Node 18+ required for optimal compatibility
- **PostgreSQL < 13:** Minimum version is now 13.x
- **Manual seeders for app store:** Admin UI now recommended over database seeders for enabling apps

## Open Questions

Things that couldn't be fully resolved:

1. **API v2 Production Readiness**
   - What we know: API v2 requires Redis (REDIS_URL) and license key (CALCOM_LICENSE_KEY)
   - What's unclear: Whether API v2 is recommended for production self-hosted instances or primarily for enterprise
   - Recommendation: Start with main web app; only add API v2 if specific API features are needed

2. **Cron Job Specifics**
   - What we know: Cron jobs are required for some features; endpoints exist in `/apps/web/app/api/cron`
   - What's unclear: Exact list of which features require cron, optimal cron schedule
   - Recommendation: Investigate cron endpoints in codebase during planning phase; set up basic hourly cron initially

3. **Enterprise Edition Boundary**
   - What we know: `/packages/features/ee/` is under commercial license (1% of codebase)
   - What's unclear: Which specific features are in EE; whether base platform has limitations without EE
   - Recommendation: Assume core scheduling works without EE; investigate specific feature needs against EE folder

4. **Docker Image Updates**
   - What we know: Docker support is community-maintained, not officially supported
   - What's unclear: Reliability of Docker images staying current with main branch
   - Recommendation: Test Docker deployment thoroughly; have manual deployment fallback; consider Railway/Render as alternatives

5. **Email Configuration Requirements**
   - What we know: Multiple email providers supported (SMTP, SendGrid, Resend)
   - What's unclear: Whether email is required for basic functionality or only for notifications
   - Recommendation: Test core booking flow without email first; add email for production

## Sources

### Primary (HIGH confidence)
- [Cal.com GitHub Repository](https://github.com/calcom/cal.com) - Main source code, README, license
- [Cal.com Local Development Docs](https://cal.com/docs/developing/local-development) - Official setup guide
- [Cal.com Self-Hosting Installation](https://cal.com/docs/self-hosting/installation) - Official deployment guide
- [Cal.com White Labeling Guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction) - Official branding customization
- [Cal.com .env.example](https://github.com/calcom/cal.com/blob/main/.env.example) - Environment variable template
- [Cal.com Contributing Guide](https://github.com/calcom/cal.com/blob/main/CONTRIBUTING.md) - Repository structure and standards

### Secondary (MEDIUM confidence)
- [Cal.com Monorepo Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo) - Internal engineering handbook (verified with official GitHub structure)
- [Cal.com Blog: AGPLv3 License Change](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition) - Official announcement about license
- [Cal.com Environment Variables Docs](https://cal.com/docs/self-hosting/guides/organization/understanding-organization-env-variables) - Organization-specific env vars

### Tertiary (LOW confidence)
- Community tutorials on self-hosting (AWS, Ubuntu, Synology) - Helpful but not officially supported
- GitHub Discussions on self-hosting issues - Real-world problems but may be outdated
- HackerNews discussions on Cal.com open source - Community perspectives on challenges

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Official documentation specifies Node 18, PostgreSQL 13+, Yarn; verified in .env.example and setup docs
- Architecture: **HIGH** - Repository structure verified directly from GitHub; monorepo patterns documented in official handbook
- Branding/White-labeling: **HIGH** - Official white-labeling guide with specific file paths and env vars
- Deployment: **MEDIUM-HIGH** - Official docs cover major platforms; Docker support explicitly marked as community-maintained
- License compliance: **HIGH** - AGPLv3 license text in repository; official blog post explains requirements
- Pitfalls: **MEDIUM** - Derived from GitHub issues, discussions, and official docs; some are recurring community problems

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - Cal.com is stable but actively developed)

**Key uncertainties for planning:**
- API v2 necessity (can be deferred)
- Exact cron job requirements (investigate during task execution)
- Enterprise Edition feature boundaries (won't affect initial fork/brand/deploy)

**Recommended next steps for planner:**
1. Create tasks for forking repository and setting up local development with `yarn dx`
2. Create branding customization tasks targeting specific files identified in research
3. Plan deployment to Next.js-compatible platform (Vercel/Railway recommended over Docker initially)
4. Include task to document AGPLv3 compliance approach (keep fork public)
5. Defer API v2, complex integrations, and enterprise features to later phases
