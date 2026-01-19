# Requirements: RainCal

**Defined:** 2026-01-19
**Core Value:** Students can book CTO advisory sessions without email scheduling — browse, pick a slot, done.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Setup & Deployment

- [ ] **SETUP-01**: Fork Cal.com repository to RainCode organization
- [ ] **SETUP-02**: Configure local development environment
- [ ] **SETUP-03**: Deploy to self-hosted infrastructure
- [ ] **SETUP-04**: Configure custom domain for RainCal
- [ ] **SETUP-05**: Set up upstream sync workflow (git remote)

### Branding

- [ ] **BRAND-01**: Replace logo with RainCode logo (from raincode.tech)
- [ ] **BRAND-02**: Apply RainCode brand colors via CSS tokens
- [ ] **BRAND-03**: Update app name to "RainCal" via environment variables
- [ ] **BRAND-04**: Customize email templates with RainCode branding

### Admin & CTO Management

- [ ] **ADMIN-01**: Admin can create organization for accelerator program
- [ ] **ADMIN-02**: Admin can add CTOs to the system (name, email)
- [ ] **ADMIN-03**: Admin can remove CTOs from the organization
- [ ] **ADMIN-04**: Admin can view booking insights (built-in dashboard)
- [ ] **ADMIN-05**: Admin can export booking data to CSV

### CTO Features

- [ ] **CTO-01**: CTO can connect Google Calendar
- [ ] **CTO-02**: CTO can connect Outlook Calendar
- [ ] **CTO-03**: CTO can set availability schedule (days, hours)
- [ ] **CTO-04**: CTO can set buffer time between meetings
- [ ] **CTO-05**: CTO can set booking limits (daily/weekly max)
- [ ] **CTO-06**: CTO can create event types (duration, video/in-person)
- [ ] **CTO-07**: CTO can add bio and profile photo
- [ ] **CTO-08**: CTO can tag expertise areas

### Student Booking

- [ ] **BOOK-01**: Student can browse CTO directory page
- [ ] **BOOK-02**: Student can filter CTOs by expertise
- [ ] **BOOK-03**: Student can see CTO availability indicator
- [ ] **BOOK-04**: Student can book meeting as guest (email only)
- [ ] **BOOK-05**: Booking auto-confirms without CTO approval
- [ ] **BOOK-06**: Student receives email confirmation
- [ ] **BOOK-07**: Student receives email reminder before meeting

### Video & Location

- [ ] **VIDEO-01**: Meetings can use Cal Video (built-in)
- [ ] **VIDEO-02**: Meetings can use Google Meet (auto-generated link)
- [ ] **VIDEO-03**: CTOs can offer in-person meeting option

### CTO Directory (Custom Build)

- [ ] **DIR-01**: Public directory page showing all CTOs
- [ ] **DIR-02**: Directory shows CTO name and photo
- [ ] **DIR-03**: Directory shows CTO bio/description
- [ ] **DIR-04**: Directory shows availability indicator
- [ ] **DIR-05**: Directory has filter/search by expertise
- [ ] **DIR-06**: Clicking CTO opens their booking page

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Admin

- **ADMIN-06**: Custom admin dashboard with university-specific metrics
- **ADMIN-07**: Booking reports in university format
- **ADMIN-08**: Program-level analytics (cohort tracking)

### Enhanced Directory

- **DIR-07**: Student booking history portal (view past meetings)
- **DIR-08**: CTO ratings/feedback from students
- **DIR-09**: Recommended CTOs based on student's project

### Integrations

- **INT-01**: University SSO integration
- **INT-02**: LMS integration (Canvas, Blackboard)
- **INT-03**: Zoom integration for CTOs who prefer it

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Payments | University program, all sessions free |
| Student accounts | Guest booking keeps friction low |
| Booking approval flow | Auto-confirm by design, CTOs set availability |
| Round-robin scheduling | Students pick specific CTOs |
| SMS/WhatsApp notifications | Email sufficient, adds cost |
| Mobile app | Web-first approach |
| Recurring meetings | Each session is ad-hoc |
| Enterprise security (SAML, SCIM) | Overkill for program scale |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Pending |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Pending |
| SETUP-04 | Phase 1 | Pending |
| SETUP-05 | Phase 1 | Pending |
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| BRAND-04 | Phase 1 | Pending |
| ADMIN-01 | Phase 2 | Pending |
| ADMIN-02 | Phase 2 | Pending |
| ADMIN-03 | Phase 2 | Pending |
| ADMIN-04 | Phase 2 | Pending |
| ADMIN-05 | Phase 2 | Pending |
| CTO-01 | Phase 2 | Pending |
| CTO-02 | Phase 2 | Pending |
| CTO-03 | Phase 2 | Pending |
| CTO-04 | Phase 2 | Pending |
| CTO-05 | Phase 2 | Pending |
| CTO-06 | Phase 2 | Pending |
| CTO-07 | Phase 2 | Pending |
| CTO-08 | Phase 3 | Pending |
| BOOK-01 | Phase 3 | Pending |
| BOOK-02 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 2 | Pending |
| BOOK-05 | Phase 2 | Pending |
| BOOK-06 | Phase 2 | Pending |
| BOOK-07 | Phase 2 | Pending |
| VIDEO-01 | Phase 2 | Pending |
| VIDEO-02 | Phase 2 | Pending |
| VIDEO-03 | Phase 2 | Pending |
| DIR-01 | Phase 3 | Pending |
| DIR-02 | Phase 3 | Pending |
| DIR-03 | Phase 3 | Pending |
| DIR-04 | Phase 3 | Pending |
| DIR-05 | Phase 3 | Pending |
| DIR-06 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-19*
*Last updated: 2026-01-19 after initial definition*
