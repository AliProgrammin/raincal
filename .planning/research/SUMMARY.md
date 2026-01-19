# Research Summary: RainCal

**Project:** RainCal - Cal.com fork for RainCode university accelerator
**Domain:** Open-source scheduling platform customization
**Researched:** 2026-01-19
**Confidence:** HIGH

## Executive Summary

Cal.com is a production-ready open-source scheduling platform explicitly designed for forking and white-labeling. It's built with Next.js 16, React 18, PostgreSQL, and Prisma in a Turborepo monorepo structure. The platform provides comprehensive self-hosting documentation and environment-based customization that allows RainCal to rebrand without modifying core code. This is not a hack—Cal.com's white-labeling system is a documented, first-class feature used by hundreds of self-hosted instances.

For the RainCal use case (university accelerator where students book CTO advisor meetings as guests), Cal.com's core features map perfectly: guest booking without accounts, calendar sync with Google/Outlook to prevent double-booking, auto-confirm bookings, customizable booking questions, and organization-level admin tracking. The payment system can be disabled by simply not configuring it—no code changes required. The platform's strength in one-on-one guest bookings makes it purpose-built for this scenario.

The primary risks are all manageable with discipline: AGPLv3 license compliance (solved by making the fork public or keeping it truly internal to the university), maintaining ability to merge upstream updates (solved by minimizing core modifications), and avoiding database schema changes without proper migrations (solved by following Prisma's migration workflow). The most critical recommendation is to customize through configuration and CSS tokens rather than code modifications, preserving the ability to pull security patches and features from upstream Cal.com.

## Key Findings

### Recommended Stack

Cal.com's stack is modern, proven, and not optional—it's the foundation you're inheriting by forking. The key technologies are Next.js 16 (full-stack React framework), PostgreSQL 13+ (mandatory database), Prisma ORM (type-safe database access), NextAuth.js (authentication and OAuth), tRPC (type-safe API layer), and Tailwind CSS 4.x (with design tokens for theming). Supporting technologies include Turborepo for monorepo management, Radix UI for accessible components, and Tanstack Query for server state.

**Core technologies:**
- **Next.js 16 + React 18**: Full-stack framework with App Router and server components—handles all frontend and API routing
- **PostgreSQL 13+**: Mandatory relational database for scheduling/availability queries—no alternatives supported
- **Prisma 6.16+**: ORM with schema-first design—all data models defined in schema.prisma, type-safety across the stack
- **NextAuth.js**: Authentication system—required for OAuth calendar integrations (Google/Outlook)
- **tRPC**: End-to-end type-safe APIs—connects frontend to backend with full TypeScript inference
- **Tailwind CSS 4.x**: Utility-first CSS with design token system—theming is done via CSS custom properties, not component modifications

**White-labeling infrastructure:**
- Environment variables (NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_COMPANY_NAME) control branding throughout the app
- CSS design tokens in apps/web/styles/globals.css allow color customization for light/dark themes
- Logo replacement in apps/web/public/ with constant updates in packages/lib/constants.ts
- All theming is configuration-based, not code changes

**Deployment recommendation:** Start with Vercel or Railway for simplicity (both handle Next.js optimization and scaling automatically), or self-host on VPS with Docker. Minimum requirements: Node 18.x, PostgreSQL 13+, 4GB RAM, Yarn 4.x package manager.

### Expected Features

Cal.com is feature-rich, but for RainCal's specific use case, many enterprise/commercial features should be disabled. The platform's architecture separates core features (AGPLv3) from enterprise features (packages/features/ee), making it straightforward to hide unwanted functionality.

**Must have (core scheduling):**
- One-on-one event types—primary use case for CTO advisor meetings
- Guest booking without accounts—students provide only email/name, no registration required
- Calendar sync (Google/Outlook)—prevents double-booking across CTOs' personal calendars
- Auto-confirm bookings—no manual approval step by default
- Availability schedules—CTOs set their own hours, buffer times, minimum notice periods
- Booking limits—daily/weekly caps to control CTO workload
- Email notifications—confirmation, reminders, cancellation flows built-in
- Booking questions—collect custom information (student program, project description, session goals)

**Must have (admin features):**
- Organization structure—admin manages all CTOs under one org with role-based access control
- Insights dashboard—track booking metrics, most/least booked CTOs, no-show rates, CSV export
- Member management—add/remove CTOs, assign roles (ADMIN/MEMBER)
- Video conferencing—Cal Video (built-in), optional Zoom/Google Meet/Teams integration per CTO preference

**Disable entirely:**
- Payment features (Stripe/PayPal)—all bookings are free, simply don't configure payment providers
- Round-robin/collective scheduling—students pick specific CTOs, not "any available"
- Recurring events—each session is unique, ad-hoc bookings only
- Enterprise security (SAML SSO, SCIM provisioning)—overkill for small scale, requires commercial license
- SMS/WhatsApp notifications—email is sufficient, adds cost and complexity

**Customize (needs adjustment):**
- Email templates—brand as RainCode, include session prep instructions
- Booking questions—add "Program", "Project Description", "Session Goal" fields
- Event duration options—create 30min and 60min event types
- Timezone handling—consider locking to university timezone if all participants are local

**Missing (need to build):**
- CTO directory/browse page—Cal.com focuses on individual booking pages, not unified directory listing
- Expertise tagging/filtering—no built-in taxonomy system for categorizing CTOs by specialization
- Student booking history portal—guest bookings work via email confirmations, but no portal for students to view their history without creating accounts

### Architecture Approach

Cal.com uses a Turborepo monorepo with strict Vertical Slice Architecture introduced in 2026. The structure separates deployable applications (apps/web for main scheduling, apps/api for public API) from shared libraries (packages/ui, packages/prisma, packages/features). Each feature domain is self-contained with components, business logic, API procedures, and tests co-located. This architecture enforces clean boundaries through linting that prevents reaching into feature internals.

**Major components:**
1. **apps/web** — Main Next.js application containing scheduling UI, booking flows, and user-facing pages. Uses hybrid Pages Router (legacy) and App Router (modern). Critical customization points: styles/globals.css for theming, public/ for logos, environment variables for branding.
2. **packages/prisma** — Database schema and migrations. Contains schema.prisma defining User, Team, EventType, Booking, Attendee models. Migration workflow is mandatory—never modify schema without running migration commands to avoid data loss.
3. **packages/features** — Vertical slices for domain logic (bookings/, availability/, organizations/). Enterprise features live in ee/ subfolder requiring commercial license. Custom RainCal features should follow this pattern: create packages/features/raincal-admin/ with self-contained components and API procedures.
4. **packages/trpc** — Type-safe API layer connecting frontend to backend. Procedures defined in routers/ with schema validation. Custom admin APIs should extend viewer routers under /raincal/ namespace.
5. **packages/ui** — Shared component library (Button, Form, Modal) based on Radix UI primitives. Reuse these components rather than building from scratch for visual consistency.

**Safe customization points:**
- Environment variables (.env)—zero code changes, low upgrade conflict risk
- CSS design tokens (globals.css)—single file, well-defined, medium conflict risk, document hex values for reapplication
- Static assets (public/)—file additions only, no conflict risk
- Custom features (packages/features/raincal-*)—isolated vertical slices, medium risk if using internal APIs
- Database extensions via metadata JSON fields or separate tables—avoid modifying core models

**Risky areas (avoid modification):**
- Core booking logic (packages/features/bookings/)—complex, heavily tested, breaks with every change
- Prisma core models (User, Booking, EventType core fields)—schema migrations will conflict, causes data integrity issues
- Authentication/authorization core—security-critical, frequent patches
- Turborepo configuration (turbo.json)—affects entire monorepo build pipeline

**Upgrade path strategy:**
- Track upstream as remote, maintain raincal/main production branch
- Minimize core modifications to reduce merge conflicts
- Document every customization with rationale
- Test thoroughly after each upstream merge (branding, admin login, booking flow, database migrations)
- Quarterly major upgrades, monthly security patches recommended

### Critical Pitfalls

Research identified 12 pitfalls, prioritized by severity and likelihood for RainCal's timeline:

1. **Modifying Prisma schema without migrations** — Developers edit schema.prisma directly, Prisma auto-updates database causing data loss in production. Always use yarn workspace @calcom/prisma db-migrate after schema changes, review generated migrations, test on production data copy, use expand-contract pattern for breaking changes. Address Phase 1 before any customizations.

2. **AGPLv3 license misunderstanding** — Teams deploy forks without understanding network copyleft requirement to provide source code to users accessing over network. For RainCal: if only accelerator staff/students use it, likely internal use with no disclosure requirement. If external users (alumni, mentors, public) can access, must provide source code (easiest via public GitHub repo). Consult university legal counsel before forking. Address Phase 0 pre-fork.

3. **Environment variable configuration hell** — Misconfigured NEXT_PUBLIC_WEBAPP_URL, NEXTAUTH_URL, or ALLOWED_HOSTNAMES causes 404s, infinite redirect loops, authentication failures, localhost redirect bugs. All three variables must align precisely. Common issue: successful login redirects to localhost:3000 instead of production domain. Test checklist: homepage access, user creation, login flow, /username booking page, email links. Address Phase 1 initial deployment.

4. **Inability to merge upstream updates** — Fork diverges from Cal.com to point where pulling updates becomes impossible, missing security patches and forcing eventual rewrite. Minimize core modifications, use configuration over code, document every change, establish weekly/monthly sync schedule, add upstream as git remote immediately. Address Phase 1 after fork.

5. **Branding modifications that break updates** — Hardcoding university branding throughout codebase instead of using white-labeling system. Known bug: disabling Cal.com branding in settings doesn't fully work (emails/page titles still show "Cal.com"). Use environment variables (NEXT_PUBLIC_APP_NAME), CSS tokens only, logo file replacement, avoid component modifications. Address Phase 2 branding.

**Additional moderate pitfalls:**
- Using Enterprise Edition features (packages/features/ee/) without commercial license—requires legal compliance check
- Docker build-time vs. runtime variable confusion—NEXT_PUBLIC_* variables require rebuild, others just restart
- Ignoring monorepo structure—creating code in wrong locations, circular dependencies, build failures

## Implications for Roadmap

Based on research findings, RainCal should follow a **configuration-first, code-last** approach with linear phase progression. The architecture supports this: early phases use safe customization points (environment, CSS, assets), later phases add isolated custom features only if needed.

### Phase 1: Fork, Brand, and Deploy (Foundation)
**Rationale:** Cal.com's white-labeling is configuration-based, not code-based. Get the foundation right before adding any custom code. Environment configuration is the most common pitfall—address it first when problems are easiest to debug.

**Delivers:** Working RainCal instance with university branding, accessible at custom domain, admin can log in, ready for CTO onboarding.

**Addresses features:**
- White-labeling (environment variables, logo replacement, CSS tokens)
- Custom domain configuration
- Self-hosted deployment infrastructure

**Avoids pitfalls:**
- Environment variable configuration hell (WEBAPP_URL, NEXTAUTH_URL, ALLOWED_HOSTNAMES must match)
- AGPLv3 license compliance (decide: public repo or internal-only)
- Upstream sync workflow (set up git remote immediately)
- Windows symlink issues (if applicable)

**Tasks:**
- Fork Cal.com repository to RainCode organization
- Update .env with RainCal branding variables
- Customize apps/web/styles/globals.css with RainCode brand colors
- Replace logos in apps/web/public/ and update packages/lib/constants.ts
- Deploy to Vercel/Railway or self-hosted VPS
- Configure custom domain DNS
- Test booking flow end-to-end
- Document all modifications for team

### Phase 2: CTO Onboarding and Calendar Sync (Core Functionality)
**Rationale:** With branding complete, focus on core use case. Cal.com's calendar integrations are production-ready—use them as-is. No code changes needed, just OAuth configuration and CTO training.

**Delivers:** CTOs can log in, connect Google/Outlook calendars, set availability schedules, create event types. Students can book meetings as guests.

**Addresses features:**
- Organization structure with role-based access control
- Calendar sync (Google in Phase 2, Outlook later if needed)
- Availability schedules and booking limits
- Guest booking without student accounts
- Auto-confirm bookings
- Email notifications and reminders

**Avoids pitfalls:**
- Using Enterprise features without license (verify Organizations feature works in self-hosted without EE)
- Admin user creation process (use NEXT_PUBLIC_DISABLE_SIGNUP toggle or seed script)
- Not understanding monorepo structure (follow existing patterns for any CTO-specific customizations)

**Tasks:**
- Create organization for RainCode Accelerator
- Set up Google Calendar OAuth credentials
- Create admin accounts for accelerator staff
- Add first CTOs as members
- Train CTOs on setting availability and event types
- Test guest booking flow (student books CTO)
- Configure email workflows (reminders, confirmations)
- Verify calendar conflict detection works

### Phase 3: Custom Admin Dashboard (Optional Enhancement)
**Rationale:** Cal.com's built-in Insights dashboard may be sufficient for basic tracking. Only build custom dashboard if specific university reporting requirements exist. If building, follow Vertical Slice Architecture to keep custom code isolated and maintainable during upgrades.

**Delivers:** Custom admin dashboard showing RainCal-specific metrics: bookings by program, CTO utilization rates, student engagement patterns, university-format reports.

**Uses stack:**
- tRPC for custom API procedures
- Prisma for querying Booking, User, Attendee models
- packages/ui components for consistent UI

**Implements architecture:**
- Create packages/features/raincal-admin/ vertical slice
- Build tRPC procedures under viewer.raincal.* namespace
- Add admin pages in apps/web/pages/raincal-admin/ or apps/web/app/raincal-admin/

**Avoids pitfalls:**
- Modifying core booking/user models (use metadata JSON fields or join queries)
- Tight coupling to Cal.com internals (import only from public APIs)
- Duplicating existing functionality (leverage Insights dashboard where possible)

**Tasks:**
- Audit Insights dashboard to identify gaps
- Design university-specific reporting requirements
- Create raincal-admin feature package
- Build custom tRPC procedures for metrics
- Implement admin UI with Cal.com component library
- Test that custom code survives upstream merges
- Document custom feature for maintenance

### Phase 4: CTO Directory and Discovery (Must Build)
**Rationale:** Cal.com doesn't provide a unified directory/browse page for students to discover CTOs—it focuses on individual booking links. This is the one feature RainCal must build from scratch. Use Cal.com's API to query organization members and render as browsable directory.

**Delivers:** Public-facing directory page where students can browse all CTOs, see bios/expertise, filter by specialization, click through to book.

**Missing features (custom build):**
- CTO directory listing with search/filter
- Expertise tagging system for CTOs
- Bio/photo display in unified interface

**Implementation approach:**
- Create packages/features/raincal-directory/ for directory logic
- Use tRPC to query organization members with public event types
- Build directory UI in apps/web/app/discover/ or /cto-directory/
- Add metadata fields to User model for expertise tags (via metadata JSON or custom table)
- Reuse Cal.com's EventType card components for consistent styling

**Avoids pitfalls:**
- Don't modify User schema core fields (use metadata JSON for expertise)
- Don't break when new CTOs added (dynamic query from database)
- Follow monorepo conventions (custom feature in packages/features/)

### Phase 5: Production Hardening (Operations)
**Rationale:** With features complete, focus on production reliability: monitoring, backups, cron jobs for reminders, performance optimization. This phase ensures RainCal is maintainable long-term and ready for semester-long usage.

**Delivers:** Production-grade RainCal with monitoring, automated backups, scheduled tasks, documented runbooks for common issues.

**Addresses:**
- Cron job configuration for email reminders and webhooks
- Database backup and restore procedures
- Error tracking with Sentry
- Performance monitoring
- Incident response runbooks
- Upstream sync schedule and testing procedures

**Avoids pitfalls:**
- Cron jobs not configured (reminders won't send)
- Memory issues during build (set NODE_OPTIONS for CI/CD)
- Missing security patches (establish monthly upstream review)

### Phase Ordering Rationale

The linear phase structure follows **safe-to-risky** and **configuration-to-code** progressions:

- **Phase 1 before Phase 2**: Must have stable branding/deployment before onboarding users. Environment configuration issues are easier to debug when no real data exists.
- **Phase 2 before Phase 3**: Validate core Cal.com features work as-is before building custom additions. May discover Insights dashboard is sufficient, eliminating need for Phase 3.
- **Phase 3 and Phase 4 can parallelize**: Admin dashboard and CTO directory are independent features—can be built by different developers simultaneously.
- **Phase 5 after features complete**: Production hardening requires stable feature set to know what to monitor and backup.

**Architecture dependencies:**
- Branding (Phase 1) affects all subsequent phases—must be complete first
- Calendar sync (Phase 2) is prerequisite for meaningful bookings—establishes data for admin dashboard
- Custom features (Phases 3-4) depend on understanding monorepo structure from Phase 1-2 experience

**Pitfall mitigation:**
- Early phases establish discipline (migrations, upstream sync, documentation) that prevent technical debt in later phases
- Configuration-first approach minimizes merge conflicts with upstream Cal.com
- Vertical slice architecture for custom features (Phases 3-4) keeps code isolated and upgradeable

### Research Flags

**Phases requiring no additional research:**
- **Phase 1 (Fork/Brand/Deploy)**: Cal.com white-labeling is extensively documented with official guides, verified GitHub examples, and clear patterns. Follow the checklist.
- **Phase 2 (CTO Onboarding)**: Calendar integrations are production-ready with official OAuth setup guides. Core scheduling features are Cal.com's primary value—well-tested and documented.
- **Phase 5 (Production Hardening)**: Standard DevOps practices, not domain-specific. Leverage existing monitoring/backup tools.

**Phases that may need targeted research:**
- **Phase 3 (Admin Dashboard)**: If building custom dashboard, may need research on specific university reporting requirements or integrations with university systems (LMS, student database). Research timing: during Phase 3 planning, not before.
- **Phase 4 (CTO Directory)**: Front-end design and UX patterns for directory/filtering interfaces may need research if team lacks design resources. Consider user research with students on discovery preferences. Research timing: before Phase 4 kickoff.

**Areas with known unknowns:**
- Organizations feature licensing: Some sources say it requires Enterprise license, others say it's available via feature flag in self-hosted. **Validation needed:** Deploy test instance in Phase 1, verify org features work without license key.
- Email white-labeling completeness: Known bugs where "Cal.com" still appears in some emails despite disabling branding. **Validation needed:** Send test emails in Phase 1, document which templates need manual updates.
- Expertise tagging implementation: Multiple approaches possible (metadata JSON, custom table, sub-teams). **Decision needed:** Phase 4 planning based on scale (how many CTOs, how many expertise areas).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified from official package.json, documentation, and GitHub repository. All technology choices are fixed by forking Cal.com. |
| Features | HIGH | Core features verified through official docs and feature pages. Missing features (directory, expertise tagging) identified through gap analysis. |
| Architecture | HIGH | Official handbook documents monorepo structure, Vertical Slice Architecture confirmed in 2026 engineering blog post, Prisma schema inspected directly. |
| Pitfalls | HIGH | Verified through official troubleshooting docs, 10+ GitHub issues with consistent patterns, community discussions, and deployment guides. |

**Overall confidence:** HIGH

Research is comprehensive and actionable. Cal.com is well-documented with active community. The fork approach is validated by hundreds of successful self-hosted instances. RainCal's use case (university accelerator booking) aligns perfectly with Cal.com's core strengths.

### Gaps to Address

Despite high confidence, three areas need validation during implementation:

- **Organizations licensing in self-hosted**: Conflicting sources on whether Organizations feature requires Enterprise Edition license or works with just feature flags in self-hosted instances. **Mitigation:** Test in Phase 1 deployment. If license required, evaluate: (1) operate without org features, (2) purchase commercial license, (3) use Team structure instead of Organization.

- **Email white-labeling completeness**: Known GitHub issues indicate "Disable branding" setting doesn't fully remove Cal.com references from all email templates and page titles. **Mitigation:** Document which templates need manual updates in Phase 1. Consider acceptable (most users won't notice) vs. blocker (university compliance requires complete rebranding).

- **Guest booking rate limiting**: No documentation found on rate-limiting bookings by email address to prevent spam or abuse by students. **Mitigation:** Test in Phase 2 whether Cal.com has built-in limits. If not, determine if needed based on expected usage patterns. Can implement custom middleware if becomes issue.

- **Expertise taxonomy approach**: Multiple valid approaches for tagging CTOs by expertise (metadata JSON, custom Prisma model, sub-teams, external service). Each has trade-offs for maintainability and upstream merge conflicts. **Mitigation:** Defer decision until Phase 4 planning when scale and requirements are clearer. Validate with user research on how students want to discover CTOs.

## Sources

### Primary (HIGH confidence)

**Official Cal.com Documentation:**
- [GitHub Repository](https://github.com/calcom/cal.com) - Verified monorepo structure, Prisma schema, environment variables
- [Self-Hosting Installation Guide](https://cal.com/docs/self-hosting/installation) - Deployment requirements and setup process
- [White-Labeling Guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction) - Theming system and branding customization
- [Database Migrations Guide](https://cal.com/docs/self-hosting/database-migrations) - Prisma migration workflow
- [Troubleshooting: Self-hosting](https://cal.com/docs/troubleshooting-guides/self-hosting) - Common issues and solutions
- [Monorepo/Turborepo Handbook](https://handbook.cal.com/engineering/codebase/monorepo-turborepo) - Architecture and codebase structure

**Official Cal.com Blog:**
- [Changing to AGPLv3 and Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition) - Licensing model explanation
- [Engineering in 2026 and Beyond](https://cal.com/blog/engineering-in-2026-and-beyond) - Vertical Slice Architecture transition
- [Large-scale Next.js Migration at Cal.com](https://codemod.com/blog/cal-next-migration) - Build performance context

**GitHub Issues (verified patterns):**
- [Issue #8501: Self hosted url stuck at localhost:3000](https://github.com/calcom/cal.com/issues/8501) - Environment variable pitfall
- [Issue #23850: Cal.com branding still in emails](https://github.com/calcom/cal.com/issues/23850) - White-labeling limitation
- [Issue #7818: Disable branding doesn't remove from page title](https://github.com/calcom/cal.com/issues/7818) - Known bug
- [Discussion #4903: Self-hosted free license limitations](https://github.com/calcom/cal.com/discussions/4903) - Enterprise features clarification

### Secondary (MEDIUM confidence)

**Community Resources:**
- [G2 Reviews 2026](https://www.g2.com/products/cal-com/reviews) - User feedback on features and self-hosting experience
- [Self-Hosting Cal.com on AWS + Docker](https://aws.plainenglish.io/self-hosting-your-own-scheduling-platform-cal-com-aws-docker-caddy-602eb6914b0e) - Deployment guide
- [How to Self-Host Cal.com on Ubuntu](https://dev.to/therealfloatdev/how-to-self-host-calcom-on-ubuntu-with-monitoring-1ph9) - Community deployment walkthrough

**Best Practices:**
- [Best Practices for Keeping a Forked Repository Up to Date](https://github.com/orgs/community/discussions/153608) - Git workflow for forks
- [Lessons learned from maintaining a fork](https://dev.to/bengreenberg/lessons-learned-from-maintaining-a-fork-48i8) - Fork maintenance strategies

### Tertiary (needs validation)

**Licensing interpretation:**
- [Mythbusting AGPLv3 Misconceptions](https://spreecommerce.org/mythbusting-agplv3-misconceptions-you-really-can-keep-your-project-private/) - AGPLv3 explanation (not Cal.com-specific)
- [AGPL License Explained](https://www.opencoreventures.com/blog/agpl-license-is-a-non-starter-for-most-companies) - License implications (general guidance)

**Recommendation:** Consult university legal counsel for specific AGPLv3 interpretation for RainCal's use case.

---

*Research completed: 2026-01-19*
*Ready for roadmap: yes*
*Next step: Requirements definition and detailed roadmap creation*
