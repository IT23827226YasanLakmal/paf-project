# PAF Assignment — Assessment 1: Module Coverage & Gap Analysis
**Smart Campus Operations Hub — IT3030 2026**
*Assessed against the assignment brief requirements*

---

## Module Coverage Summary

| Module | Requirement | Status |
|--------|-------------|--------|
| A — Facilities & Assets Catalogue | Search, filter, metadata, status | ✅ Done |
| B — Booking Management | PENDING→APPROVED→CANCELLED workflow, conflict detection, admin review | ✅ Done |
| C — Maintenance & Incident Ticketing | OPEN→IN_PROGRESS→RESOLVED→CLOSED, comments, technician assignment | ⚠️ Partial |
| D — Notifications | Booking/ticket events, UI panel | ✅ Done |
| E — Authentication & Authorization | OAuth 2.0 via Supabase, JWT, RBAC | ✅ Done |

---

## Critical Gaps

### 1. GitHub Actions Workflow — MISSING
- No `.github/workflows/` directory exists in the repo.
- The rubric explicitly requires a build + test CI workflow.
- Even a basic workflow that runs `mvn test` and `npm run build` is enough for Good (3-4/5).

### 2. Ticket Image Attachments — Incomplete
- The spec says up to 3 image attachments per ticket.
- `IncidentTicket` model has a single `imageUrl` field (one image only).

### 3. Ticket Comment Edit — Missing
- Assignment: "edit/delete as appropriate" for comment ownership.
- `TicketController` has `DELETE /comments/{id}` but no `PUT /comments/{id}` for editing.
- No ownership check on delete (any user can delete any comment).

### 4. Security Config — Incorrectly Permissive
- `SecurityConfig` has `.requestMatchers("/api/tickets/**").permitAll()` and `"/api/resources/**").permitAll()`.
- Unauthenticated users can CREATE, DELETE, and UPDATE tickets and resources.

### 5. Technician Assignment to Ticket — Not Exposed via API
- `IncidentTicket` model has no `assignedTechnician` field.
- No explicit assignment endpoint exists.

---

## Strengths

| Area | What You Have |
|------|--------------|
| REST Naming | Clean: `/api/resources`, `/api/bookings/{id}/status`, `/api/tickets/{id}/comments` |
| HTTP Methods | Correct use of GET/POST/PUT/PATCH/DELETE with 200/201/204/400/403/404 |
| Layered Architecture | Controller → Service → Repository clearly separated |
| DTOs | Proper request/response DTOs with validation (`@Valid`) |
| Spring Security + JWT | JWT filter, `SecurityFilterChain`, `@PreAuthorize` |
| Supabase OAuth | Google OAuth via Supabase, synced to backend via `/api/auth/sync` |
| Roles | USER, ADMIN, TECHNICIAN, FACILITY_MANAGER, BOOKING_OFFICER |
| Notifications | Backend model + controller + UI bell component |
| Audit Log | `AuditService` tracks ticket status changes |
| QR Code Check-in | Innovation: `/api/bookings/verify-qr/{token}` ✨ |
| Service-level timer | `firstResponseAt` and `resolvedAt` tracked on tickets ✨ |
| UI/UX | Premium dark theme, glassmorphism, animated sidebar, role-based dashboards |
| React Architecture | Zustand stores, React Query, modular components |

---

## Estimated Score Projection

| Category | Max | Estimated | Notes |
|----------|-----|-----------|-------|
| Documentation (Group) | 15 | 10–12 | Depends on report quality |
| REST API – Endpoint Naming | 5 | 5 | Excellent |
| REST API – REST Constraints | 10 | 7–8 | Minor: permissive security |
| REST API – HTTP Methods/Codes | 10 | 7–8 | Missing PATCH comment edit |
| REST API – Code Quality | 5 | 4–5 | Clean, DTOs, validation |
| REST API – Requirements | 5 | 3–4 | Missing: attach ×3, assign |
| Client – Architecture | 5 | 4–5 | Modular, Zustand, React Query |
| Client – Requirements | 5 | 3–4 | Mirrors backend gaps |
| Client – UI/UX | 10 | 8–9 | Premium design |
| Git (Group) | 5 | 3–4 | Active history needed |
| GitHub Actions (Group) | 5 | 0–1 | MISSING — urgent |
| OAuth Authentication (Group) | 10 | 7–8 | Supabase OAuth works |
| Creativity (Group) | 10 | 8–9 | QR, audit, SLA timers |
| **TOTAL** | **100** | **73–86** | |

---

## Priority Action List

| Priority | Task | Est. Time |
|----------|------|-----------|
| 🔴 1 | Create `.github/workflows/ci.yml` | 30 min |
| 🔴 2 | Fix `SecurityConfig` — POST/PUT/DELETE on tickets/resources must require auth | 20 min |
| 🔴 3 | Add `PATCH /api/tickets/comments/{id}` with ownership check | 45 min |
| 🟡 4 | Add `assignedUserId` to `IncidentTicket` + assign endpoint | 1 hr |
| 🟡 5 | Add multi-image support to tickets (at least imageUrl2 + imageUrl3) | 1 hr |
| 🟡 6 | Add `@Tag` / `@Operation` to all controllers | 20 min |
| 🟢 7 | Write 1–2 unit tests (BookingServiceImpl conflict check) | 1 hr |
| 🟢 8 | Finalize README with setup steps | 30 min |
