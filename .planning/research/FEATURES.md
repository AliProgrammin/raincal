# Features Research: Cal.com for RainCal

**Project:** RainCal (Cal.com fork)
**Use Case:** University accelerator CTO advisor booking system
**Scale:** 20-50 CTOs (advisors), 100-500 students (guests)
**Researched:** 2026-01-19
**Overall Confidence:** HIGH (based on official documentation, GitHub, and verified sources)

---

## Executive Summary

Cal.com is a feature-rich open-source scheduling platform with extensive capabilities. For RainCal's specific use case (advisor booking for university accelerator), most core features are directly applicable, but many enterprise/commercial features should be disabled or hidden. The platform's strength in guest booking (no account required), calendar sync, and admin tracking makes it well-suited for this use case.

**Key Finding:** Cal.com's architecture separates core features (AGPLv3) from enterprise features (`/packages/features/ee`), making it straightforward to disable unwanted features in a self-hosted fork.

---

## Keep (Essential Features)

These features are critical for RainCal's university accelerator use case and should remain enabled.

### Core Scheduling Features

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **One-on-One Event Types** | Primary use case: 1 student books 1 CTO | Default event type |
| **Guest Booking (No Account)** | Students book without creating accounts | Core requirement - works via email only |
| **Calendar Sync (Google/Outlook/Apple)** | CTOs need calendar conflict detection | Prevents double-booking across personal calendars |
| **Availability Schedules** | CTOs set their own available hours | Unlimited schedules supported |
| **Auto-Confirm Bookings** | No manual approval needed | Default behavior (don't enable "Requires Confirmation") |
| **Buffer Time** | CTOs need breaks between sessions | Before/after event padding |
| **Minimum Notice** | Prevent last-minute bookings | E.g., "book at least 24h in advance" |
| **Booking Limits** | Control frequency per CTO | Daily/weekly/monthly caps |
| **Future Booking Limits** | Control how far ahead students can book | E.g., "max 30 days in advance" |

**Confidence:** HIGH - These are core Cal.com features verified through [official documentation](https://cal.com/docs/introduction) and [feature pages](https://cal.com/features).

### Booking Management

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **Booking Dashboard** | CTOs view/manage their bookings | Shows upcoming, past, unconfirmed |
| **Reschedule** | Students/CTOs can reschedule | Built into booking confirmation emails |
| **Cancel** | Either party can cancel | Built into booking confirmation emails |
| **Email Notifications** | Confirmation, reminder, cancellation emails | Critical for communication |
| **Booking Questions** | Collect student info (program, project, goals) | Custom fields per event type |
| **Email Required** | Only mandatory field for guests | Name also collected but email is key |

**Confidence:** HIGH - Core booking features verified via [booking documentation](https://cal.com/help/bookings) and [workflows](https://cal.com/features/workflows).

### Admin Features (Organization/Team Management)

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **Organization Structure** | Admin manages all CTOs under one org | Requires Organizations feature flag |
| **Team/Sub-teams** | Organize CTOs by expertise/track | Hierarchical structure |
| **Admin Role** | Admin can add CTOs, view all bookings | RBAC with ADMIN/OWNER roles |
| **Insights Dashboard** | Track booking metrics, top performers | CSV export available |
| **Member Management** | Add/remove CTOs, assign roles | Via organization settings |
| **Event Types Management** | Create standard event types for all CTOs | Managed Events feature |

**Confidence:** HIGH - Organization features documented in [GitHub README](https://github.com/calcom/cal.com/blob/main/packages/features/ee/organizations/README.md) and [organization setup docs](https://cal.com/docs/self-hosting/guides/organization/organization-setup).

### Video Conferencing

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **Cal Video (Built-in)** | No external account needed | Daily.co based |
| **Zoom Integration** | If CTOs prefer Zoom | Optional, per-CTO |
| **Google Meet Integration** | If CTOs prefer Google Meet | Optional, per-CTO |
| **Microsoft Teams Integration** | If CTOs prefer Teams | Optional, per-CTO |

**Confidence:** HIGH - Video conferencing options confirmed via [conferencing docs](https://cal.com/docs/platform/atoms/conferencing-apps) and [integrations page](https://cal.com/blog/online-meeting-platforms-for-2024).

### Email/Notification System

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **Workflows (Email Automation)** | Automated reminders, confirmations | Reduce no-shows |
| **Custom Email Templates** | Brand as RainCode | Template customization |
| **Reminder Timing** | 24h and 1h before meeting | Configurable triggers |

**Confidence:** HIGH - Workflow features verified via [workflows documentation](https://cal.com/features/workflows) and [automation guides](https://cal.com/blog/how-to-use-cal-com-workflows).

### Branding/White-Label

| Feature | Why Essential | Notes |
|---------|--------------|-------|
| **Custom Brand Colors** | RainCode branding | Light/dark theme support |
| **Logo Replacement** | Replace Cal.com logo with RainCode | Self-hosted white-labeling |
| **Custom Domain** | raincal.university.edu | DNS configuration |
| **Remove Cal.com Branding** | No "Powered by Cal.com" | Via globals.css modification |

**Confidence:** HIGH - White-labeling documented in [official guide](https://cal.com/docs/self-hosting/guides/white-labeling/introduction) and [branding blog](https://cal.com/blog/what-type-of-customization-options-does-cal-com-offer).

---

## Disable/Hide (Not Needed for RainCal)

These features add complexity without value for the university accelerator use case. Disable or hide them.

### Payment Features (Not Needed)

| Feature | Why Disable | How to Disable |
|---------|------------|----------------|
| **Stripe Integration** | No payment required | Don't install Stripe app |
| **PayPal Integration** | No payment required | Don't install PayPal app |
| **Paid Bookings** | All bookings are free | Don't enable on event types |
| **Payment Fee Collection** | N/A | Note: Cal.com collects fees on self-hosted Stripe, irrelevant if disabled |

**Confidence:** HIGH - Payment features optional per [Stripe docs](https://cal.com/docs/self-hosting/apps/install-apps/stripe) and [payments page](https://cal.com/features/payments).

### Advanced Scheduling Types (Not Needed)

| Feature | Why Disable | Notes |
|---------|------------|----------------|
| **Round-Robin Scheduling** | Not booking "any available CTO" | Students pick specific CTOs |
| **Collective Events** | Not booking multiple CTOs at once | One-on-one only |
| **Group/Multi-Person Booking** | One student per booking | Workshop-style not needed |
| **Recurring Events** | Ad-hoc bookings, not recurring | Each session is unique |
| **Booking Seats (Offer Seats)** | Not group sessions | One-on-one model |

**Confidence:** MEDIUM - These are optional features that can be hidden by not creating these event types. Verified via [event types guide](https://cal.com/blog/event-types-guide-calcom) and [round-robin docs](https://cal.com/help/event-types/round-robin).

### Enterprise Security Features (Overkill)

| Feature | Why Disable | Notes |
|---------|------------|----------------|
| **SAML SSO** | Not needed for small scale | Enterprise Edition feature |
| **SCIM Provisioning** | Manual CTO management is fine | Enterprise Edition feature |
| **HIPAA Compliance** | Not handling PHI | Enterprise Edition feature |
| **SOC 2 Features** | Not needed for internal tool | Enterprise Edition feature |
| **Audit Logs** | Insights dashboard sufficient | Enterprise Edition feature |

**Confidence:** HIGH - These are Enterprise Edition (`/ee`) features requiring license keys. Documented in [enterprise page](https://cal.com/enterprise) and [GitHub /ee folder](https://github.com/calcom/cal.com/tree/main/packages/features/ee).

### Commercial/SaaS Features (Not Relevant)

| Feature | Why Disable | Notes |
|---------|------------|----------------|
| **User Impersonation** | Privacy concern, not needed | Team owner feature |
| **Platform Mode** | Not building a scheduling platform | For resellers/multi-tenant |
| **Public Metrics Dashboard** | Internal tool, keep private | cal.com/open feature |
| **SMS Notifications** | Email sufficient, adds cost | Workflow feature, costly |
| **WhatsApp Notifications** | Email sufficient | Workflow feature |

**Confidence:** HIGH - Optional features that can be disabled by not configuring them. Verified via [platform docs](https://cal.com/platform) and [SMS workflows](https://cal.com/blog/sms-workflows-automated-notifications).

### Routing Forms (Probably Not Needed)

| Feature | Why Likely Disable | Notes |
|---------|-------------------|-------|
| **Routing Forms** | Students likely browse CTO directory, not routed | Teams plan feature |
| **Conditional Routing** | Not qualifying leads | May be useful later for triage |

**Confidence:** MEDIUM - Could be useful if you want "match me with a CTO for X topic" but your description implies students pick CTOs directly. Optional feature via [routing page](https://cal.com/routing).

---

## Customize (Needs Modification)

Features that exist but need adjustment for RainCal's context.

### CTO Profile Pages

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Profile Display** | Show CTO bio, expertise, photo | Existing user profile fields |
| **Event Type Names** | "Book a Session with [CTO Name]" instead of generic | Rename event types |
| **CTO Directory/Listing** | Students need to browse available CTOs | **BUILD THIS** - not built-in |

**Confidence:** HIGH for existing features, MEDIUM for directory (needs custom build).

### Booking Questions

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Add "Program" field** | Track which accelerator program | Custom booking question |
| **Add "Project Description"** | Context for CTOs | Custom booking question |
| **Add "Session Goal"** | What student wants to discuss | Custom booking question |
| **Remove "Phone Number"** | Email is sufficient | Hide optional field |

**Confidence:** HIGH - Booking questions are fully customizable per [booking questions guide](https://cal.com/blog/customize-your-scheduling-environment-a-guide-to-cal-com-s-booking-questions).

### Email Templates

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Sender Name** | "RainCode Accelerator" not "Cal.com" | Workflow customization + self-hosted email config |
| **Email Copy** | University tone, not corporate | Custom templates |
| **Include Prep Instructions** | What to bring to session | Email template or booking confirmation message |

**Confidence:** HIGH - Email customization supported via [workflows](https://cal.com/features/workflows) and [email customization](https://cal.com/blog/how-to-use-cal-com-workflows).

### Event Duration Options

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Standard Durations** | 30min, 60min options | Create 2 event types |
| **Quick Questions** | Maybe 15min option? | Additional event type |

**Confidence:** HIGH - Multiple event types with different durations are core Cal.com functionality.

### Timezone Handling

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Lock Timezone?** | If all bookings are local (same timezone) | Enable "Lock Timezone" feature |
| **Display University Timezone** | Make it clear what timezone CTOs operate in | Configure per-CTO or globally |

**Confidence:** HIGH - Timezone features documented in [timezone guide](https://cal.com/blog/simplify-your-physical-appointments-how-cal-com-s-lock-timezone-enhances-booking).

### Booking Confirmation Settings

| What to Customize | Why | Implementation |
|-------------------|-----|----------------|
| **Auto-Confirm by Default** | Per requirements: auto-confirm | Ensure "Requires Confirmation" is OFF |
| **Optional Manual Approval** | Some CTOs may want approval | Per-event-type toggle |

**Confidence:** HIGH - Requires Confirmation is a per-event-type setting documented in [confirmation guide](https://cal.com/blog/requires-confirmation-feature-calcom).

---

## Admin Capabilities (Built-In)

Cal.com provides robust admin features out of the box for tracking and management.

### Organization Admin Features

| Capability | Description | Access |
|------------|-------------|--------|
| **Member Management** | Add/remove CTOs, assign ADMIN/MEMBER roles | `/settings/organizations/{slug}/members` |
| **Insights Dashboard** | View all bookings, top performers, trends | Organization-level analytics |
| **CSV Export** | Export booking data for analysis | Insights page export |
| **Managed Events** | Create template event types for all CTOs | Standardize event settings |
| **Organization Settings** | Configure org-wide defaults | `/settings/organizations/{slug}` |

**Confidence:** HIGH - Organization features verified via [organization admin docs](https://cal.com/help/roles/make-user-an-org-admin) and [insights docs](https://cal.com/docs/enterprise-features/insights).

### Tracking Capabilities (Who Booked Whom)

| Metric | Available? | How to Access |
|--------|-----------|---------------|
| **Who booked whom** | YES | Booking records show attendee + host |
| **Booking frequency per CTO** | YES | Insights dashboard |
| **Most/Least booked CTOs** | YES | Insights dashboard KPI |
| **Booking trends over time** | YES | Insights time-series |
| **No-show tracking** | YES | Mark bookings as no-show |
| **Cancellation tracking** | YES | Booking status history |
| **Booking duration analytics** | YES | Average event duration metric |

**Confidence:** HIGH - Insights feature documented in [insights docs](https://cal.com/docs/enterprise-features/insights) and [dashboard guide](https://cal.com/blog/a-complete-walkthrough-of-cal-com-s-booking-dashboard-its-key-features).

### API Access (For Custom Reporting)

| Capability | Description | Endpoint |
|------------|-------------|----------|
| **Get All Bookings** | Retrieve booking data programmatically | API v2: `/v2/bookings` |
| **Filter by Date Range** | Custom reporting periods | Query parameters |
| **Webhooks** | Real-time booking notifications | BOOKING_CREATED, BOOKING_CANCELLED, etc. |
| **Export to External Tools** | Push data to Google Sheets, BI tools | Via webhooks or API polling |

**Confidence:** HIGH - API v2 documented in [API reference](https://cal.com/docs/api-reference/v2/bookings/get-all-bookings) and [webhooks guide](https://cal.com/docs/developing/guides/automation/webhooks).

**Note:** API v1 will be deprecated February 28, 2026. Use API v2 for all integrations.

---

## Missing (May Need to Build)

Features required for RainCal that Cal.com doesn't provide out-of-the-box.

### CTO Directory/Browse Page

**What's Needed:** Public page where students can browse all CTOs, filter by expertise, see bios, and click through to book.

**Why Not Built-In:** Cal.com focuses on individual booking pages, not a unified directory.

**Implementation Options:**
1. **Custom Frontend:** Build a React page that queries Cal.com API for users in the organization, displays as cards/grid
2. **Team Page Hack:** Use Cal.com's team feature, but it's designed for collective booking, not browsing
3. **External Portal:** Separate app that embeds Cal.com booking links

**Effort:** Medium (custom frontend development)

**Confidence:** HIGH that this needs custom work - no built-in directory feature found.

### Student History Tracking

**What's Needed:** Students see their past bookings, upcoming bookings (without creating an account).

**Why Not Built-In:** Cal.com assumes bookers either have accounts OR are one-time guests. Your use case is repeat guests.

**Implementation Options:**
1. **Email Magic Link:** Send unique link to access booking history via email
2. **Simple Portal:** Student enters email, sees their bookings (via API lookup)
3. **Just Use Email:** Booking confirmations have links to reschedule/cancel individual bookings

**Effort:** Low to Medium depending on approach

**Confidence:** MEDIUM - Could work with email confirmations alone, but custom portal would be better UX.

### CTO Expertise Tagging/Filtering

**What's Needed:** Tag CTOs by expertise (e.g., "AI/ML", "Hardware", "Go-to-Market") and let students filter.

**Why Not Built-In:** Cal.com doesn't have a tagging/taxonomy system for users.

**Implementation Options:**
1. **Profile Custom Fields:** Use user bio or custom fields, parse in custom directory
2. **Team-Based:** Create sub-teams per expertise area (but CTOs may span multiple)
3. **External Metadata:** Store expertise tags in separate database, join on user ID

**Effort:** Medium (depends on directory implementation)

**Confidence:** HIGH that this needs custom work.

### Booking Approval Workflow (Optional)

**What's Needed:** Some CTOs may want to approve bookings (screen students).

**Why Not Fully Supported:** Cal.com has "Requires Confirmation" per event type, but you wanted auto-confirm by default.

**Implementation Options:**
1. **Per-Event-Type Toggle:** CTOs who want approval create separate event type with confirmation enabled
2. **Default OFF:** Standard event types auto-confirm, CTOs opt-in to manual confirmation

**Effort:** Low (feature exists, just needs configuration)

**Confidence:** HIGH - This is a built-in feature that meets the need.

### Admin Blocking/Limiting Students

**What's Needed:** If a student is abusive (booking/canceling repeatedly), admin can block them.

**Why Not Built-In:** Cal.com has "Blocklist" feature but it's per-user, not org-wide.

**Implementation Options:**
1. **Email Blocklist:** Each CTO blocks problem emails individually
2. **Custom Middleware:** API layer that checks blocklist before allowing booking
3. **Org-Level Blocklist:** Feature request to Cal.com or custom database

**Effort:** Low (use existing blocklist) to Medium (custom org-wide blocklist)

**Confidence:** MEDIUM - Blocklist exists per [security docs](https://cal.com/help/security) but org-wide blocking may need custom work.

### Usage Reports for University Admin

**What's Needed:** Monthly reports on accelerator activity (bookings per program, CTO utilization, etc.)

**Why Not Built-In:** Insights dashboard has data but may not have specific cuts/exports needed.

**Implementation Options:**
1. **CSV Export + Excel:** Download from Insights, analyze manually
2. **API + BI Tool:** Connect Cal.com API to Looker, Power BI, or Metabase
3. **Custom Dashboard:** Build internal dashboard with desired metrics

**Effort:** Low (use CSV) to Medium (custom dashboard)

**Confidence:** HIGH - Insights provides raw data, custom reporting is additional layer.

---

## Feature Dependencies

Key relationships between features:

```
Organization Setup
  ├─> Add CTOs as Members
  │    ├─> CTOs Connect Calendars
  │    ├─> CTOs Create Event Types
  │    └─> CTOs Set Availability
  │
  ├─> Admin Views Insights
  │    └─> Requires bookings to exist
  │
  └─> White-Label/Branding
       └─> Applied org-wide

Student Booking Flow
  ├─> Browse CTO Directory (CUSTOM BUILD)
  ├─> Click CTO → View Event Types
  ├─> Select Time Slot (checks CTO availability + calendar conflicts)
  ├─> Fill Booking Questions (custom fields)
  ├─> Auto-Confirm (no approval)
  └─> Receive Email Confirmation (with video link, reschedule/cancel links)

Workflows
  ├─> Trigger: BOOKING_CREATED
  │    └─> Actions: Send confirmation, send reminder (24h before)
  ├─> Trigger: BOOKING_RESCHEDULED
  │    └─> Actions: Send update email
  └─> Trigger: BOOKING_CANCELLED
       └─> Actions: Send cancellation email
```

---

## Configuration Recommendations

### Phase 1: MVP (Essential Only)

**Enable:**
- One-on-one event types
- Guest booking (no student accounts)
- Auto-confirm bookings
- Calendar sync (Google/Outlook)
- Email notifications (basic)
- Availability schedules
- Booking limits (min notice, future limit)
- Admin organization dashboard

**Skip:**
- Payments (disable entirely)
- Round-robin/collective events
- SMS/WhatsApp notifications
- Routing forms
- Advanced workflows
- Platform/SSO features

**Custom Build:**
- CTO directory (browse page)
- Basic expertise filtering

### Phase 2: Enhanced (Post-Launch)

**Add:**
- Custom workflows (advanced reminders, follow-ups)
- No-show tracking
- Booking analytics reports
- Student booking history portal
- CTO performance insights

**Custom Build:**
- Admin dashboard with custom metrics
- Integration with university systems (if needed)

### Phase 3: Scale (If Grows Beyond Initial Scope)

**Consider:**
- API integrations with LMS or university portal
- Advanced routing (match students to CTOs by expertise)
- Group sessions/workshops (collective events)
- Recurring office hours (recurring events)

---

## Enterprise Edition (EE) Features Analysis

Cal.com's codebase separates:
- **Core (AGPLv3):** `/packages/features/*` - Free, open source
- **Enterprise (`/ee`):** `/packages/features/ee/*` - Requires commercial license

**EE Features in RainCal Context:**

| EE Feature | Needed? | Alternative |
|------------|---------|-------------|
| Organizations | YES | Self-hosted, enable feature flag |
| SAML SSO | NO | Email login sufficient |
| SCIM Provisioning | NO | Manual CTO management |
| HIPAA/SOC2 | NO | Not handling sensitive data |
| Managed Events | MAYBE | Useful for standardizing event types |
| Insights Dashboard | YES | Core reporting feature |
| Workflows (Advanced) | MAYBE | Email workflows useful |

**License Implications:**
- Organizations feature requires enterprise license OR feature flag for self-hosted
- Check if self-hosted Organizations requires license key (conflicting info in sources)
- May need to reach out to Cal.com or inspect code to confirm

**Confidence:** MEDIUM - Some sources say Organizations requires EE license, others say it's available via feature flag in self-hosted. Needs verification before forking.

---

## Summary Table: Keep vs Disable vs Customize

| Feature Category | Count | Disposition |
|-----------------|-------|-------------|
| **Core Scheduling** | 10 | KEEP ALL |
| **Booking Management** | 6 | KEEP ALL |
| **Admin/Organization** | 6 | KEEP ALL |
| **Video Conferencing** | 4 | KEEP (optional integrations) |
| **Email/Notifications** | 3 | KEEP + CUSTOMIZE |
| **Branding** | 4 | KEEP + CUSTOMIZE |
| **Payments** | 4 | DISABLE ALL |
| **Advanced Scheduling** | 5 | DISABLE (except maybe recurring for office hours) |
| **Enterprise Security** | 5 | DISABLE (overkill) |
| **Commercial/SaaS** | 5 | DISABLE |
| **Routing Forms** | 2 | DISABLE (or defer to Phase 2) |
| **Customizations Needed** | 7 areas | Branding, questions, emails, event types |
| **Missing (Build)** | 6 features | CTO directory, expertise filtering, student portal |

---

## Open Questions / Validation Needed

1. **Organizations License:** Does self-hosted Cal.com Organizations feature require EE license or just feature flag? (conflicting sources)
   - **Action:** Check `.env` flags and test, or contact Cal.com
   - **Source Conflict:** [GitHub discussion on free license](https://github.com/calcom/cal.com/discussions/4903) vs [Docs saying EE required](https://github.com/calcom/cal.com/blob/main/packages/features/ee/organizations/README.md)

2. **White-Label Sender Email:** Can we fully white-label outgoing emails (sender address) in self-hosted?
   - **Issue:** [GitHub #10819](https://github.com/calcom/cal.com/issues/10819) mentions sender email still shows "cal.com"
   - **Action:** Test email configuration in self-hosted instance

3. **API v2 Stability:** API v2 is current (v1 deprecated Feb 2026), but are all features documented?
   - **Action:** Review API docs before building custom directory
   - **Source:** [API v2 docs](https://cal.com/docs/api-reference/v2)

4. **Stripe Fee on Self-Hosted:** Cal.com collects Stripe fees even on self-hosted (0.5% + $0.10)
   - **Irrelevant if payments disabled**, but good to know
   - **Source:** [GitHub issue #3601](https://github.com/calcom/cal.com/issues/3601)

5. **Guest Booking Limits:** Can we rate-limit bookings by email to prevent spam?
   - **Not found in docs** - may need custom middleware
   - **Action:** Test booking limits per guest email

---

## Sources Summary

**Confidence Level:** HIGH for most features (80%+ verified via official docs, GitHub, or recent reviews)

**Primary Sources:**
- [Cal.com Official Docs](https://cal.com/docs/introduction) - Core feature documentation
- [Cal.com GitHub](https://github.com/calcom/cal.com) - Code structure, EE features
- [Cal.com Feature Pages](https://cal.com/features) - Marketing + feature descriptions
- [Cal.com Blog](https://cal.com/blog) - Feature guides and tutorials
- [G2 Reviews 2026](https://www.g2.com/products/cal-com/reviews) - User feedback on features
- [API v2 Documentation](https://cal.com/docs/api-reference/v2) - Integration capabilities

**Secondary Sources:**
- Third-party reviews (efficient.app, youcanbook.me) - Feature comparisons
- GitHub Issues/Discussions - Known problems and feature requests
- Integration guides (Latenode, Relay.app) - Workflow automation examples

**Areas with Lower Confidence:**
- Organizations licensing requirements (conflicting sources)
- White-label email sender (known issue)
- Multi-tenant/Platform mode details (not well documented)

---

## Conclusion

Cal.com is **highly suitable** for RainCal's use case with minimal modifications needed:

✅ **Strengths:**
- Guest booking without accounts (perfect for students)
- Organization/admin features for tracking CTOs
- Calendar sync prevents double-booking
- Customizable booking questions
- Auto-confirm bookings by default
- White-label/branding support

⚠️ **Gaps (Need Custom Build):**
- CTO directory/browse page (students need to find CTOs)
- Expertise filtering/tagging
- Student booking history (without accounts)

❌ **Disable/Remove:**
- Payments (Stripe, PayPal)
- Round-robin/collective scheduling
- Enterprise security (SSO, SCIM)
- SMS/WhatsApp (cost, complexity)

**Next Steps:**
1. Confirm Organizations feature licensing for self-hosted
2. Set up test instance with feature flags
3. Design CTO directory UI (custom build)
4. Configure white-label branding
5. Create template event types for CTOs
6. Test booking flow end-to-end
