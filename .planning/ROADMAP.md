# Roadmap: RainCal

## Overview

RainCal transforms Cal.com into a branded scheduling platform for the RainCode university accelerator. Phase 1 establishes the foundation by forking, branding, and deploying a working instance. Phase 2 enables CTOs to manage their availability and students to book meetings as guests with calendar sync and auto-confirmation. Phase 3 adds a custom directory for students to browse and discover CTOs by expertise.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Fork, Brand, and Deploy** - RainCal instance with branding running on custom domain
- [ ] **Phase 2: CTO Onboarding and Core Booking** - CTOs can manage availability, students can book meetings as guests
- [ ] **Phase 3: CTO Directory and Discovery** - Students can browse and filter CTOs before booking

## Phase Details

### Phase 1: Fork, Brand, and Deploy
**Goal**: Working RainCal instance with RainCode branding accessible at custom domain
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05, BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Success Criteria** (what must be TRUE):
  1. Admin can access RainCal at custom domain and log in successfully
  2. RainCal displays RainCode logo and brand colors throughout the interface
  3. All email notifications show RainCode branding (no Cal.com references)
  4. Fork can pull upstream Cal.com updates without conflicts
  5. Test booking flow completes successfully (create event type, book as guest, receive confirmation)
**Plans**: TBD

Plans:
- [ ] 01-01: [TBD during planning]

### Phase 2: CTO Onboarding and Core Booking
**Goal**: CTOs can set availability and students can book meetings as guests with auto-confirmation
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, CTO-01, CTO-02, CTO-03, CTO-04, CTO-05, CTO-06, CTO-07, BOOK-04, BOOK-05, BOOK-06, BOOK-07, VIDEO-01, VIDEO-02, VIDEO-03
**Success Criteria** (what must be TRUE):
  1. Admin can add CTOs to organization and view all members
  2. CTO can connect Google Calendar and see their existing events prevent booking conflicts
  3. CTO can set availability schedule (days/hours) and buffer time between meetings
  4. CTO can create event types with custom durations, video/in-person options, and booking limits
  5. Student can book a meeting as guest (email only) and receive auto-confirmation immediately
  6. Both CTO and student receive email reminders before scheduled meetings
  7. Admin can view booking insights dashboard and export data to CSV
**Plans**: TBD

Plans:
- [ ] 02-01: [TBD during planning]

### Phase 3: CTO Directory and Discovery
**Goal**: Students can browse all CTOs with filtering and click through to book
**Depends on**: Phase 2
**Requirements**: CTO-08, BOOK-01, BOOK-02, BOOK-03, DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, DIR-06
**Success Criteria** (what must be TRUE):
  1. Student can access public directory page showing all available CTOs
  2. Directory displays each CTO's name, photo, bio, and availability indicator
  3. Student can filter CTOs by expertise tags (e.g., "AI/ML", "Infrastructure", "Product")
  4. Clicking a CTO in directory opens their booking page with available time slots
  5. CTO can add expertise tags to their profile visible in directory
**Plans**: TBD

Plans:
- [ ] 03-01: [TBD during planning]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fork, Brand, and Deploy | 0/TBD | Not started | - |
| 2. CTO Onboarding and Core Booking | 0/TBD | Not started | - |
| 3. CTO Directory and Discovery | 0/TBD | Not started | - |
