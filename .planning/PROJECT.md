# RainCal

## What This Is

A Cal.com fork customized with RainCode branding for a university accelerator program. Students can browse CTO advisors and book meetings directly, eliminating email back-and-forth scheduling. CTOs manage their own availability and sync with their existing calendars.

## Core Value

Students can book CTO advisory sessions without email scheduling — browse, pick a slot, done.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Fork Cal.com and set up local development environment
- [ ] Apply RainCode branding (colors, logo from raincode.tech)
- [ ] Admin can add CTOs to the system (name, email)
- [ ] CTOs can connect their Google/Outlook calendars
- [ ] CTOs can set their availability windows
- [ ] CTOs can configure meeting types (duration, video/in-person)
- [ ] Students can browse available CTOs
- [ ] Students can book meetings as guests (email only, no account required)
- [ ] Bookings auto-confirm (no approval step)
- [ ] Email confirmations sent to both parties
- [ ] Remove/disable payment features (not needed)
- [ ] Self-hosted deployment configuration

### Out of Scope

- Payment integration — university program, no paid consultations
- Student accounts/login — guest booking keeps it simple
- University SSO integration — not needed for v1
- Real-time chat — booking only
- Mobile app — web-first

## Context

**Program:** University accelerator connecting students (founders) with industry CTO advisors for mentorship sessions.

**Current pain:** Scheduling happens via email, creating back-and-forth and no central tracking of who met with whom.

**Scale:** 20-50 CTOs, 100-500 students

**Meeting format:** Flexible — video calls or in-person, duration varies by CTO preference

**Tracking needs (v2):** Admin wants visibility into all bookings, meeting history, attendance, and usage statistics (which CTOs are popular, meetings per student)

## Constraints

- **Base:** Cal.com open source fork — leverage existing scheduling infrastructure
- **Branding:** RainCode identity (raincode.tech) — non-negotiable for launch
- **Calendar sync:** Must integrate with Google Calendar and Outlook — CTOs won't manage availability manually
- **Hosting:** Self-hosted on own infrastructure
- **Timeline:** ASAP — program is already running

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork Cal.com | Mature scheduling platform, handles calendar sync, booking flows, reminders | — Pending |
| Guest booking (no student accounts) | Reduces friction, students just enter email | — Pending |
| Auto-confirm bookings | CTOs set availability = implicit approval | — Pending |
| No payments | University program, not commercial consultations | — Pending |

---
*Last updated: 2025-01-19 after initialization*
