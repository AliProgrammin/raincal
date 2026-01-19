# Pitfalls Research: Cal.com Fork

**Project:** RainCal - Cal.com fork for university accelerator
**Researched:** 2026-01-19
**Overall confidence:** HIGH (verified with official docs, GitHub issues, community discussions)

## Executive Summary

Cal.com forks commonly fail due to five critical mistake categories: **licensing misunderstanding** (AGPLv3 obligations), **environment misconfiguration** (URL/hostname mismatches), **unsafe database changes** (Prisma schema modifications without migrations), **fork drift** (inability to pull upstream updates), and **enterprise feature confusion** (/ee folder licensing). The most expensive mistake is modifying Prisma schemas without migrations, which can cause data loss in production. The most common mistake is environment variable misconfiguration, causing 404s and authentication loops.

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major compliance issues.

### Pitfall 1: Modifying Prisma Schema Without Migrations

**What goes wrong:**
Developers modify `schema.prisma` directly and run the application, which triggers Prisma to auto-update the database schema. Prisma cannot always infer how to transform existing data, leading to **data loss or corruption** in production.

**Why it happens:**
- Coming from frameworks with auto-migrations (Rails, Django)
- Not understanding Prisma's migration model
- Treating development database like production
- Skipping documentation about database changes

**Consequences:**
- **Data loss**: Prisma drops columns it can't map
- **Production downtime**: Database becomes incompatible with code
- **Irreversible damage**: No automatic rollback mechanism
- **Loss of migration history**: Can't reproduce database state

**Prevention:**
1. **Always create migrations**: Run `yarn workspace @calcom/prisma db-migrate` after schema changes
2. **Never modify schema.prisma without a migration**: Treat it as read-only without migration workflow
3. **Descriptive migration names**: Use clear names like `user_add_accelerator_field`
4. **Review generated migrations**: Always inspect what Prisma generates before applying
5. **Test migrations on copy of production data**: Never apply untested migrations to production
6. **Use expand-contract pattern for breaking changes**: Add new column → migrate data → remove old column

**Detection (warning signs):**
- Anyone editing `schema.prisma` without running migration command
- Pull request with schema changes but no migration files
- "Database schema differs from migration" errors
- Prisma generating DROP COLUMN statements for existing data

**When to address:** Phase 1 (setup) - establish migration discipline before any customizations

**References:**
- [Cal.com Database Migrations](https://cal.com/docs/self-hosting/database-migrations)
- [Data migration on Postgres · Issue #15133](https://github.com/calcom/cal.com/issues/15133)

---

### Pitfall 2: AGPLv3 License Misunderstanding

**What goes wrong:**
Teams fork Cal.com without understanding AGPLv3's network copyleft requirement. When they customize and deploy their fork, they're legally required to provide source code to users who access it over the network. Not complying can lead to **legal action** and **forced source disclosure**.

**Why it happens:**
- Confusing AGPLv3 with MIT/Apache (permissive licenses)
- Believing "open source" means "do whatever you want"
- Not consulting legal before forking
- Misunderstanding what "network use" means

**Consequences:**
- **Legal liability**: License violation lawsuits
- **Forced disclosure**: Must open-source your modifications
- **Commercial impossibility**: Can't sell proprietary SaaS without commercial license
- **Intellectual property loss**: Custom features become open source

**Prevention:**
1. **Understand three paths:**
   - **Internal use only**: No distribution/network access → No source disclosure required
   - **Public deployment (AGPLv3 compliant)**: Must provide source to users
   - **Commercial license**: Pay Cal.com for proprietary use rights

2. **For university accelerator use case:**
   - If only accelerator staff/students use RainCal → likely internal use
   - If external users (alumni, mentors, public) can access → network use triggers AGPLv3
   - Consult university legal counsel to determine classification

3. **If compliance required:**
   - Add "Source Code" link in footer pointing to your fork's repo
   - Keep fork public on GitHub
   - Document modifications clearly
   - Include AGPLv3 license text

4. **If commercial license needed:**
   - Contact Cal.com sales for enterprise license
   - Typically for businesses selling access to Cal.com

**Detection (warning signs):**
- Planning to keep fork private while deploying publicly
- Marketing RainCal as "proprietary" or "exclusive"
- Hiding source code from users who access the application
- Selling access without commercial license

**When to address:** Phase 0 (pre-fork) - decide license strategy before writing any code

**References:**
- [Changing to AGPLv3 and introducing the Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition)
- [Mythbusting AGPLv3 Misconceptions](https://spreecommerce.org/mythbusting-agplv3-misconceptions-you-really-can-keep-your-project-private/)
- [Cal.com GitHub](https://github.com/calcom/cal.com)

---

### Pitfall 3: Environment Variable Configuration Hell

**What goes wrong:**
Cal.com requires precise environment variable configuration for URLs, hostnames, and authentication. Misconfiguration causes **404 errors**, **infinite redirect loops**, **authentication failures**, and **localhost redirect bugs** that are difficult to debug.

**Why it happens:**
- Cal.com's multi-URL architecture (WEBAPP_URL, NEXTAUTH_URL, ALLOWED_HOSTNAMES)
- Container networking vs. local DNS resolution differences
- Build-time vs. runtime environment variable confusion
- Copy-pasting examples without understanding their purpose

**Consequences:**
- **404 on user pages**: Can access admin, but booking pages fail
- **Localhost redirect**: Logs in, then redirects to localhost:3000
- **Authentication loops**: Can't complete OAuth/email login flows
- **Hostname mismatch warnings**: App starts but with warnings about URL mismatches

**Prevention:**

**Core variables that must match:**
```bash
# CRITICAL: All three must align
NEXT_PUBLIC_WEBAPP_URL=https://raincal.youruni.edu
NEXTAUTH_URL=https://raincal.youruni.edu/api/auth
ALLOWED_HOSTNAMES='"youruni.edu","raincal.youruni.edu"'
```

**Common patterns:**

1. **Docker deployment:**
   ```bash
   # External URL (what users see)
   NEXT_PUBLIC_WEBAPP_URL=https://raincal.youruni.edu

   # Internal URL (what container uses)
   NEXTAUTH_URL=http://localhost:3000/api/auth

   # Both external domains
   ALLOWED_HOSTNAMES='"youruni.edu","raincal.youruni.edu"'
   ```

2. **SSL behind load balancer:**
   ```bash
   # Only if you trust your load balancer
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

3. **Local development:**
   ```bash
   NEXT_PUBLIC_WEBAPP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000/api/auth
   ALLOWED_HOSTNAMES='"localhost"'
   ```

**Testing checklist:**
- [ ] Can access homepage
- [ ] Can create user account
- [ ] Can complete login flow (no localhost redirect)
- [ ] Can access /username booking page (no 404)
- [ ] "View Public Page" button works
- [ ] Email links point to correct domain

**Detection (warning signs):**
- "Match of WEBAPP_URL with ALLOWED_HOSTNAME failed" in logs
- 404 when accessing `/username` pages
- Successful login redirects to `http://localhost:3000`
- Email notifications contain localhost links
- Build succeeds but runtime fails

**When to address:** Phase 1 (initial deployment) - get this right before any customization

**References:**
- [Cal.com Troubleshooting: Self-hosting](https://cal.com/docs/troubleshooting-guides/self-hosting)
- [Self hosted url stuck at localhost:3000 · Issue #8501](https://github.com/calcom/cal.com/issues/8501)
- [cal.com deployment redirects to localhost:3000 · Issue #21921](https://github.com/calcom/cal.com/issues/21921)
- [Environment Variables Documentation](https://cal.com/docs/self-hosting/guides/organization/understanding-organization-env-variables)

---

### Pitfall 4: Inability to Merge Upstream Updates

**What goes wrong:**
Fork diverges from upstream Cal.com to the point where pulling updates becomes impossible. Team is stuck maintaining a legacy codebase, missing security patches, bug fixes, and new features. Eventually forces a complete rewrite or abandonment of customizations.

**Why it happens:**
- Modifying core files instead of extending through plugins
- Making widespread changes across the codebase
- Not tracking which files are customized
- Treating fork as "our codebase" instead of "Cal.com + our customizations"
- No regular upstream sync schedule

**Consequences:**
- **Security vulnerabilities**: Missing critical security patches from upstream
- **Technical debt accumulation**: Can't benefit from upstream refactors
- **Feature stagnation**: Can't adopt new Cal.com features without massive merge conflicts
- **Maintenance burden**: Must maintain all of Cal.com yourself
- **Eventual rewrite**: Fork becomes unmaintainable, force migration

**Prevention:**

**1. Minimize core modifications:**
- Use Cal.com's plugin architecture for new features
- Modify only configuration files when possible
- Extend through composition, not modification
- Keep custom code in separate directories

**2. Document every modification:**
```markdown
## RainCal Custom Modifications

### Modified Core Files
- `apps/web/styles/globals.css` - Brand colors (lines 45-67)
- `packages/lib/constants.ts` - Logo references (line 12, 34)
- `apps/web/public/` - Custom logos

### Custom Packages
- `packages/features/accelerator/` - University-specific features
- `apps/web/pages/accelerator/` - Custom pages

### Why Modified
- Branding: Required for white-label
- Analytics: University compliance requirements
```

**3. Use Git strategically:**
```bash
# Add upstream as remote
git remote add upstream https://github.com/calcom/cal.com.git

# Create custom branch structure
main (your production)
├── raincal-custom (your modifications)
└── upstream-staging (upstream changes)

# Regular sync workflow (weekly/monthly)
git checkout upstream-staging
git pull upstream main
git checkout raincal-custom
git merge upstream-staging  # Review conflicts carefully
```

**4. Configuration over code:**
```typescript
// BAD: Hardcoding university name in components
export function Header() {
  return <h1>University Accelerator</h1>
}

// GOOD: Using environment variables
export function Header() {
  return <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
}
```

**5. Use feature flags for custom features:**
```typescript
// Isolate custom code behind flags
if (process.env.NEXT_PUBLIC_ACCELERATOR_MODE === "true") {
  // RainCal-specific features
}
```

**Sync schedule:**
- **Security patches**: Immediate (same day)
- **Bug fixes**: Weekly review
- **Feature updates**: Monthly evaluation
- **Major versions**: Quarterly assessment

**Detection (warning signs):**
- No upstream sync in 3+ months
- Merge conflicts in >50% of files when attempting sync
- "This file has diverged too much" messages
- Custom modifications in >20% of codebase
- No documented list of customizations

**When to address:** Phase 1 (immediately after fork) - establish sync workflow before making changes

**References:**
- [Best Practices for Keeping a Forked Repository Up to Date](https://github.com/orgs/community/discussions/153608)
- [Lessons learned from maintaining a fork](https://dev.to/bengreenberg/lessons-learned-from-maintaining-a-fork-48i8)
- [The Dynamic Relationship of Forks with their Upstream Repository](https://openscapes.org/blog/2025-02-20-forks-upstream-relationship/)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or require refactoring.

### Pitfall 5: Branding Modifications That Break Updates

**What goes wrong:**
Hardcoding university branding throughout the codebase instead of using Cal.com's white-labeling system. When upstream updates modify UI components, all custom branding breaks. Known bug: disabling branding in settings doesn't fully remove Cal.com references (emails still show "Cal.com", page titles still append "| Cal.com").

**Why it happens:**
- Not knowing about white-labeling environment variables
- Doing "quick fixes" instead of proper configuration
- Modifying components directly instead of CSS tokens
- Not reading white-labeling documentation

**Consequences:**
- Branding breaks with every Cal.com update
- Inconsistent branding (some pages say "RainCal", others "Cal.com")
- Email notifications still reference "Cal.com"
- Page titles append "| Cal.com" despite settings

**Prevention:**

**Use white-labeling system properly:**

1. **Environment variables (set these first):**
```bash
NEXT_PUBLIC_APP_NAME="RainCal"
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS="support@youruni.edu"
NEXT_PUBLIC_COMPANY_NAME="University Accelerator"
```

2. **Logo updates:**
```bash
# Replace files in apps/web/public/
- cal-logo.svg → raincal-logo.svg
- cal-icon.svg → raincal-icon.svg

# Update references in packages/lib/constants.ts
export const LOGO = "/raincal-logo.svg"
export const LOGO_ICON = "/raincal-icon.svg"
```

3. **Theme colors (apps/web/styles/globals.css):**
```css
/* Modify color tokens, don't add new CSS */
:root {
  --cal-brand: #your-primary-color;
  --cal-brand-emphasis: #your-accent-color;
  /* etc. */
}
```

4. **Known bugs to work around:**
```bash
# Issue: "Disable branding" setting doesn't work completely
# Workaround: Manually update email templates if needed
# Track: https://github.com/calcom/cal.com/issues/23850
# Track: https://github.com/calcom/cal.com/issues/7818

# Issue: Terms/Privacy links still point to cal.com
# Workaround: Currently no env var override
# Proposed: TERMS_OF_USE_URL and PRIVACY_POLICY_URL env vars
# Track: https://github.com/calcom/cal.com/issues/20705
```

**Detection (warning signs):**
- Searching codebase for "Cal.com" returns your modifications
- Branding appears inconsistent across pages
- Email templates still say "Cal.com"
- Page titles still append "| Cal.com"
- Upstream UI updates break your branding

**When to address:** Phase 2 (branding) - after environment is stable

**References:**
- [White-labeling Guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction)
- [Cal.com branding disabled in settings still occurs in emails · Issue #23850](https://github.com/calcom/cal.com/issues/23850)
- [Disable branding doesn't remove Cal.com from page title · Issue #7818](https://github.com/calcom/cal.com/issues/7818)

---

### Pitfall 6: Using Enterprise Features Without License

**What goes wrong:**
Team assumes that because they forked the repo, all code in `/packages/features/ee` (Enterprise Edition) is available for use. Deploy features that require commercial license, receive cease-and-desist, or features simply don't work because they require backend services only available to licensed customers.

**Why it happens:**
- "It's in the repo, so it's open source" assumption
- Not understanding dual-licensing model
- Not reading license files in /ee folder
- Confusing "can see the code" with "can use the code"

**Consequences:**
- Legal violation of commercial license terms
- Features appear in UI but don't function (no backend support)
- Wasted development time integrating features that won't work
- Potential legal action from Cal.com, Inc.

**Prevention:**

**Understand licensing boundaries:**

1. **AGPLv3 (free to use):**
   - Everything except `/packages/features/ee`
   - Core scheduling functionality
   - Basic customization
   - Self-hosting infrastructure

2. **Commercial license required:**
   - Everything in `/packages/features/ee/`
   - "Multiplayer APIs" (multi-user/org features)
   - Advanced workflows
   - Some integrations
   - Priority support

**Check before using:**
```bash
# If feature code is in this directory, it requires commercial license
packages/features/ee/

# Example enterprise features that require license:
# - Teams/organizations
# - Advanced workflows
# - Some app integrations
# - SAML SSO
# - Managed event types
```

**For university accelerator:**
- Basic scheduling per user: AGPLv3 (free)
- If need team scheduling: May need commercial license
- Contact Cal.com sales if uncertain

**Detection (warning signs):**
- Importing from `@calcom/features/ee/*` in your code
- Features work in development but fail in production
- License warnings in console during build
- Features require API keys you don't have

**When to address:** Phase 0 (planning) - audit feature requirements before starting

**References:**
- [Self-hosted free license - limitations · Discussion #4903](https://github.com/calcom/cal.com/discussions/4903)
- [Changing to AGPLv3 and introducing the Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition)
- [Cal.com Enterprise](https://cal.com/enterprise)

---

### Pitfall 7: Docker Build-Time vs. Runtime Variable Confusion

**What goes wrong:**
Developers change environment variables in `.env` file and restart containers, expecting changes to apply. Variables that are baked into the build at build-time (NEXT_PUBLIC_*) don't update without rebuilding. Cal.com uses Next.js which bakes certain variables into the JavaScript bundle.

**Why it happens:**
- Not understanding Next.js build process
- Assuming all environment variables work the same
- Not reading Cal.com's Docker documentation
- Coming from frameworks where all env vars are runtime

**Consequences:**
- Configuration changes don't take effect
- Developers waste hours debugging "why isn't my change working"
- Incorrect URLs in production after environment changes
- Confusion about which variables require rebuilds

**Prevention:**

**Understand variable types:**

1. **Build-time variables (require rebuild):**
```bash
# All NEXT_PUBLIC_* variables are baked into JS bundle
NEXT_PUBLIC_WEBAPP_URL
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_COMPANY_NAME
NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS
NEXT_PUBLIC_LOGGER_LEVEL

# To change these:
docker-compose build  # Rebuild image
docker-compose up     # Restart with new image
```

2. **Runtime variables (hot-reload):**
```bash
# These can change without rebuild
DATABASE_URL
NEXTAUTH_SECRET
CRON_API_KEY
STRIPE_API_KEY

# To change these:
docker-compose restart  # Just restart, no rebuild needed
```

**Workflow:**
```bash
# When changing NEXT_PUBLIC_* variables:
1. Update .env file
2. docker-compose down
3. docker-compose build --no-cache
4. docker-compose up -d

# When changing other variables:
1. Update .env file
2. docker-compose restart
```

**Development vs. Production:**
```bash
# Development: Fast rebuilds
yarn dev  # Watches for changes

# Production: Full rebuilds required
yarn build  # Bakes env vars into bundle
yarn start  # Runs pre-built bundle
```

**Detection (warning signs):**
- Changed NEXT_PUBLIC_* variable but UI still shows old value
- Restarted container but change didn't apply
- Build logs don't show new variable values
- Different behavior between development and production

**When to address:** Phase 1 (deployment setup) - understand before deploying

**References:**
- [Cal.com Docker Documentation](https://cal.com/docs/self-hosting/docker)
- [Docker - Cal.com Docs](https://hub.docker.com/r/calcom/cal.com)
- [Self-Hosting Your Own Scheduling Platform](https://aws.plainenglish.io/self-hosting-your-own-scheduling-platform-cal-com-aws-docker-caddy-602eb6914b0e)

---

### Pitfall 8: Ignoring Cal.com's Monorepo Structure

**What goes wrong:**
Developers treat Cal.com like a single Next.js app, not understanding it's a Turborepo monorepo with multiple apps and shared packages. They modify code in the wrong location, create circular dependencies, or break the build pipeline by not following monorepo conventions.

**Why it happens:**
- Not reading monorepo documentation
- Assuming it's just a Next.js app
- Not understanding Turborepo's structure
- Coming from single-app backgrounds

**Consequences:**
- Build failures: "Cannot find module @calcom/ui"
- Circular dependency errors
- Changes in one package don't trigger rebuilds
- Deployment failures due to missing dependencies
- Can't add new packages/apps properly

**Prevention:**

**Understand the structure:**

```
cal.com/
├── apps/           (Full deployable applications)
│   ├── web/        → app.cal.com (main application)
│   ├── website/    → cal.com (marketing site)
│   ├── api/        → api.cal.com
│   └── docs/       → docs.cal.com
│
├── packages/       (Shared internal libraries)
│   ├── ui/         → @calcom/ui
│   ├── lib/        → @calcom/lib
│   ├── prisma/     → @calcom/prisma
│   ├── features/   → @calcom/features
│   │   ├── ee/     → (Enterprise - licensed separately)
│   │   └── ...
│   └── ...
│
└── turbo.json      (Build pipeline configuration)
```

**Where to put custom code:**

1. **University-specific features:**
```bash
# Create new package for custom features
packages/features/accelerator/
├── package.json
├── index.ts
└── components/
    └── AcceleratorDashboard.tsx

# Reference in package.json of consuming app:
{
  "dependencies": {
    "@calcom/features": "*",  # Asterisk for local packages
    "@calcom/accelerator": "*"
  }
}
```

2. **Custom pages:**
```bash
# Add to main web app
apps/web/pages/accelerator/
├── index.tsx
└── dashboard.tsx
```

3. **Custom branding:**
```bash
# Modify theme tokens
apps/web/styles/globals.css

# Update constants
packages/lib/constants.ts
```

**Using local packages:**
```typescript
// In your custom code
import { Button } from "@calcom/ui"  // Shared UI components
import { prisma } from "@calcom/prisma"  // Database client
import { useLocale } from "@calcom/lib/hooks"  // Shared hooks

// Your custom package
import { AcceleratorDashboard } from "@calcom/accelerator"
```

**Building in monorepo:**
```bash
# Build all packages and apps
yarn build

# Build specific workspace
yarn workspace @calcom/ui build
yarn workspace apps/web build

# Run in development (watches all packages)
yarn dev

# Add dependency to specific workspace
yarn workspace apps/web add some-package
```

**Detection (warning signs):**
- "Cannot find module @calcom/*" errors
- Changes in packages/ don't trigger rebuilds
- Build works locally but fails in CI/CD
- Creating files in wrong directories
- Not understanding where to add custom code

**When to address:** Phase 1 (before making modifications) - understand structure first

**References:**
- [Monorepo / Turborepo | Cal.com Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo)
- [Cal.com Contributor's Guide](https://cal.com/docs/developing/open-source-contribution/contributors-guide)

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 9: Not Setting Up Proper Admin User Creation

**What goes wrong:**
After deployment, there's no admin interface to create the first user. Must use Prisma Studio (localhost:5555) or direct database access, which is cumbersome and not secure for production.

**Why it happens:**
- Not reading self-hosting troubleshooting guide
- Expecting signup page to be available by default
- Not setting up proper user creation flow

**Consequences:**
- Can't create users easily
- Must expose Prisma Studio or database to create accounts
- Security risk if Prisma Studio left running in production
- Poor onboarding experience for accelerator staff

**Prevention:**

**Option 1: Enable signup during initial setup:**
```bash
# Set this to allow first user creation
NEXT_PUBLIC_DISABLE_SIGNUP=false

# After creating admin, disable it
NEXT_PUBLIC_DISABLE_SIGNUP=true
```

**Option 2: Use Prisma Studio for first user only:**
```bash
# Start Prisma Studio
yarn workspace @calcom/prisma db-studio

# Access at http://localhost:5555
# Create user manually
# Stop Prisma Studio (don't leave running)
```

**Option 3: Seed script for admin:**
```typescript
// Create scripts/create-admin.ts
import { prisma } from "@calcom/prisma";
import * as bcrypt from "bcryptjs";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("CHANGE_ME", 10);
  await prisma.user.create({
    data: {
      email: "admin@youruni.edu",
      password: hashedPassword,
      username: "admin",
      name: "Admin User",
    },
  });
}

createAdmin().then(() => console.log("Admin created"));
```

**Detection (warning signs):**
- No way to create first user after deployment
- Prisma Studio exposed in production
- Database credentials shared for user creation
- Manual SQL inserts for user creation

**When to address:** Phase 1 (initial deployment)

---

### Pitfall 10: Cron Jobs Not Configured

**What goes wrong:**
Features requiring scheduled tasks (reminders, webhooks, cleanup) don't work because cron jobs aren't set up. Cal.com relies on cron for time-sensitive operations.

**Why it happens:**
- Not reading deployment requirements
- Assuming Next.js handles everything
- Coming from platforms with built-in cron (Vercel)

**Consequences:**
- Email reminders don't send
- Webhook retries don't happen
- Database cleanup doesn't run
- Time-based workflows fail

**Prevention:**

**For Vercel deployment:**
```json
// Follow Vercel cron documentation
// Add to vercel.json
{
  "crons": [{
    "path": "/api/cron/...",
    "schedule": "*/5 * * * *"
  }]
}
```

**For self-hosted (Docker/VPS):**
```bash
# Add to crontab or use Docker cron
*/5 * * * * curl http://localhost:3000/api/cron/reminder
```

**Detection (warning signs):**
- Reminders never send
- Scheduled tasks don't execute
- No cron-related logs
- Time-dependent features broken

**When to address:** Phase 3 (when enabling reminder/webhook features)

---

### Pitfall 11: Windows Development Setup Issues

**What goes wrong:**
Cloning on Windows without symlink support causes missing files and broken builds. Cal.com uses symlinks extensively.

**Why it happens:**
- Not reading Windows-specific setup instructions
- Using default `git clone` on Windows
- No admin privileges for symlinks

**Consequences:**
- Build fails with "file not found" errors
- Some features mysteriously don't work
- Confusing errors about missing modules

**Prevention:**
```bash
# Windows users MUST clone with this flag
git clone -c core.symlinks=true https://github.com/calcom/cal.com.git

# Or enable globally
git config --global core.symlinks true
```

**Detection (warning signs):**
- Cloned on Windows without symlink flag
- "File not found" errors for existing files
- Build works on Mac/Linux but not Windows

**When to address:** Phase 0 (before cloning)

**References:**
- [Cal.com README - Windows instructions](https://github.com/calcom/cal.com)
- [Bug: Cal.com Setup Broken on Windows 11 · Issue #22680](https://github.com/calcom/cal.com/issues/22680)

---

### Pitfall 12: Memory Issues During Build

**What goes wrong:**
Next.js build process runs out of memory, especially when supporting both Pages Router and App Router during Cal.com's incremental migration. Builds fail with OOM errors on machines with <8GB RAM or in CI/CD.

**Why it happens:**
- Large Next.js application with dual router support
- Heavy dependencies bundled twice
- Insufficient build resources
- Not optimizing Node memory settings

**Consequences:**
- Build failures in CI/CD
- Local development requires powerful machine
- Slow build times
- Developers waste time troubleshooting OOM errors

**Prevention:**

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=16384"

# In Docker, allocate sufficient memory
docker-compose.yml:
services:
  app:
    mem_limit: 8g
```

**For CI/CD:**
```yaml
# GitHub Actions example
- name: Build
  run: yarn build
  env:
    NODE_OPTIONS: "--max-old-space-size=8192"
```

**Detection (warning signs):**
- "JavaScript heap out of memory" errors
- Build succeeds locally but fails in CI
- Build process killed without clear error
- Slow build times (>10 minutes)

**When to address:** Phase 1 (when setting up CI/CD)

**References:**
- [Large-scale Next.js Migration at Cal.com](https://codemod.com/blog/cal-next-migration)

---

## Phase-Specific Warnings

### Phase 1: Initial Fork & Setup
**Likely pitfalls:**
- AGPLv3 license misunderstanding
- Windows symlink issues
- Environment variable configuration
- Not establishing upstream sync workflow

**Mitigation:**
- Consult legal about license compliance
- Use `git clone -c core.symlinks=true` on Windows
- Document environment variable configuration
- Set up upstream remote immediately

---

### Phase 2: Branding Customization
**Likely pitfalls:**
- Hardcoding branding instead of using white-label system
- Modifying too many core files
- Not tracking which files are customized
- Breaking Cal.com's theme system

**Mitigation:**
- Use environment variables for all branding
- Only modify CSS tokens, not components
- Document every file modification
- Test that upstream updates don't break branding

---

### Phase 3: Database Customizations
**Likely pitfalls:**
- Modifying Prisma schema without migrations
- Breaking database compatibility with upstream
- Data loss from unsafe migrations
- Not testing migrations on production-like data

**Mitigation:**
- Always use migration workflow
- Review generated migrations before applying
- Test migrations on copy of production data
- Use expand-contract pattern for breaking changes

---

### Phase 4: Custom Features
**Likely pitfalls:**
- Using enterprise features without license
- Not understanding monorepo structure
- Creating tight coupling with core code
- Breaking plugin architecture

**Mitigation:**
- Audit feature requirements (AGPLv3 vs. commercial)
- Create custom packages following monorepo conventions
- Extend through composition, not modification
- Use feature flags to isolate custom code

---

### Phase 5: Production Deployment
**Likely pitfalls:**
- Docker build-time vs. runtime variable confusion
- Missing cron job configuration
- Insufficient memory allocation
- Not configuring first admin user

**Mitigation:**
- Understand which variables require rebuild
- Set up cron jobs for scheduled tasks
- Allocate 8GB+ RAM for builds
- Create admin user setup script

---

### Phase 6: Ongoing Maintenance
**Likely pitfalls:**
- Inability to merge upstream updates
- Fork drifting too far from upstream
- Missing security patches
- Accumulating technical debt

**Mitigation:**
- Establish weekly/monthly upstream sync schedule
- Minimize core file modifications
- Monitor Cal.com security releases
- Keep list of customizations up to date

---

## Quick Reference: Red Flags Checklist

Before deploying RainCal, verify you've avoided these critical mistakes:

- [ ] **License compliance:** Understand AGPLv3 obligations or acquired commercial license
- [ ] **Upstream sync:** Set up `upstream` remote and documented sync workflow
- [ ] **Environment config:** All URL variables (WEBAPP_URL, NEXTAUTH_URL, ALLOWED_HOSTNAMES) match
- [ ] **Migration discipline:** Never modify schema.prisma without creating migration
- [ ] **Branding strategy:** Used white-label env vars, not hardcoded modifications
- [ ] **Custom code isolation:** Created separate packages/features, not modifying core
- [ ] **Build variables:** Understand which env vars require rebuild vs. restart
- [ ] **Monorepo structure:** Know where to put custom code (apps/ vs. packages/)
- [ ] **Admin creation:** Have process for creating first user
- [ ] **Cron setup:** Configured scheduled tasks if using reminders/webhooks
- [ ] **Memory allocation:** Set NODE_OPTIONS for builds
- [ ] **Documentation:** Listed all files modified and reasons why

---

## Confidence Assessment

| Pitfall Category | Confidence | Source |
|-----------------|------------|--------|
| Database/Prisma | HIGH | Official docs + GitHub issues |
| License/AGPLv3 | HIGH | Official blog post + legal articles |
| Environment vars | HIGH | Official docs + 10+ GitHub issues |
| Fork maintenance | MEDIUM | Community best practices + blog posts |
| Branding | HIGH | Official white-label docs + known bugs |
| Enterprise features | HIGH | Official licensing docs |
| Docker | HIGH | Official Docker docs + GitHub issues |
| Monorepo | HIGH | Official handbook |
| Admin setup | MEDIUM | Community discussions |
| Cron jobs | MEDIUM | Official docs + deployment guides |
| Windows setup | HIGH | Official README + GitHub issues |
| Build memory | HIGH | Cal.com migration blog post |

---

## Sources

### Official Documentation
- [Cal.com Self-Hosting Troubleshooting](https://cal.com/docs/troubleshooting-guides/self-hosting)
- [Database Migrations Guide](https://cal.com/docs/self-hosting/database-migrations)
- [White-Labeling Introduction](https://cal.com/docs/self-hosting/guides/white-labeling/introduction)
- [Environment Variables](https://cal.com/docs/self-hosting/guides/organization/understanding-organization-env-variables)
- [Cal.com Docker Documentation](https://cal.com/docs/self-hosting/docker)
- [Monorepo Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo)

### Cal.com Official
- [Changing to AGPLv3 and Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition)
- [Large-scale Next.js Migration at Cal.com](https://codemod.com/blog/cal-next-migration)
- [Cal.com GitHub Repository](https://github.com/calcom/cal.com)

### GitHub Issues (Critical Bugs)
- [Migrate found failed migrations · Issue #2398](https://github.com/calcom/cal.com/issues/2398)
- [Cal.com branding still occurs in emails · Issue #23850](https://github.com/calcom/cal.com/issues/23850)
- [Disable branding doesn't remove from page title · Issue #7818](https://github.com/calcom/cal.com/issues/7818)
- [Self hosted url stuck at localhost:3000 · Issue #8501](https://github.com/calcom/cal.com/issues/8501)
- [Deployment redirects to localhost:3000 · Issue #21921](https://github.com/calcom/cal.com/issues/21921)
- [Windows Setup Broken · Issue #22680](https://github.com/calcom/cal.com/issues/22680)

### GitHub Discussions
- [Self-hosted free license limitations · Discussion #4903](https://github.com/calcom/cal.com/discussions/4903)
- [Hacker News: Cal.com self-hosting challenges](https://news.ycombinator.com/item?id=34508935)

### Community Best Practices
- [Best Practices for Keeping a Forked Repository Up to Date](https://github.com/orgs/community/discussions/153608)
- [Lessons learned from maintaining a fork](https://dev.to/bengreenberg/lessons-learned-from-maintaining-a-fork-48i8)
- [The Dynamic Relationship of Forks with their Upstream Repository](https://openscapes.org/blog/2025-02-20-forks-upstream-relationship/)
- [How to Successfully Fork an Open-Source Project](https://www.heavybit.com/library/article/how-to-fork-an-open-source-project)

### License Information
- [Mythbusting AGPLv3 Misconceptions](https://spreecommerce.org/mythbusting-agplv3-misconceptions-you-really-can-keep-your-project-private/)
- [AGPL License Explained](https://www.opencoreventures.com/blog/agpl-license-is-a-non-starter-for-most-companies)

### Deployment Guides
- [Self-Hosting Cal.com on AWS + Docker](https://aws.plainenglish.io/self-hosting-your-own-scheduling-platform-cal-com-aws-docker-caddy-602eb6914b0e)
- [How to Self-Host Cal.com on Ubuntu](https://dev.to/therealfloatdev/how-to-self-host-calcom-on-ubuntu-with-monitoring-1ph9)
