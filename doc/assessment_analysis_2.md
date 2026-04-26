# IT3030 PAF 2026 — Official Rubric Assessment
**Smart Campus Operations Hub**
*Rubric-by-rubric scoring with codebase evidence*

---

## 📄 DOCUMENTATION — 15 Marks (Group)

| Band | Range | Evidence |
|------|-------|----------|
| **Predicted: Good → Excellent** | **10–14** | Depends entirely on the PDF report quality, not the code. |

**What you have:**
- `README.md` exists with setup steps ✅
- `ASSIGNMENT DOCS/` directory present ✅
- `doc/seed_bookings_tickets.sql` demonstrates DB design ✅

**Risk**: If the PDF report doesn't include architecture diagrams, endpoint lists, and team contribution tables — you drop to 8–11. Write the report clearly.

---

## 🌐 REST API — 30 Marks (Individual)

### Endpoint Naming — 5 Marks
**Predicted: Excellent — 5/5**

| Evidence | Assessment |
|----------|------------|
| `/api/resources`, `/api/resources/{id}` | ✅ RESTful, noun-based |
| `/api/bookings/{id}/status` | ✅ Sub-resource action |
| `/api/tickets/{id}/comments` | ✅ Nested resource |
| `/api/bookings/verify-qr/{token}` | ✅ Meaningful naming |
| `/api/auth/sync`, `/api/auth/login` | ✅ Correct auth namespace |

No issues. Consistent, meaningful, follows standards throughout.

---

### REST Architectural Constraints — 10 Marks
**Predicted: Good — 7/10**

| Constraint | Status | Note |
|-----------|--------|------|
| Client-Server | ✅ | React client + Spring Boot API fully separated |
| Stateless | ✅ | JWT-based, no server sessions (`STATELESS` policy set) |
| Uniform Interface | ✅ | Consistent resource naming and HTTP methods |
| Layered System | ✅ | Controller → Service → Repository clearly separated |
| Cacheable | ⚠️ | No `Cache-Control` headers declared |
| Code-on-Demand | ➖ | Optional, generally not expected in assignments |

**Deduction reason**: Missing cacheability headers/annotations. Otherwise solid.

---

### HTTP Methods & Status Codes — 10 Marks
**Predicted: Excellent — 8–9/10**

| Endpoint | Method | Status Code | Correct? |
|----------|--------|-------------|----------|
| Create booking | POST | 201 | ✅ |
| Get bookings | GET | 200 | ✅ |
| Update booking | PUT | 200 | ✅ |
| Update status | PATCH | 200 | ✅ |
| Delete booking | DELETE | 204 | ✅ |
| Create ticket | POST | 201 | ✅ |
| Create resource | POST | 201 | ✅ |
| Delete resource | DELETE | 204 | ✅ |
| Booking conflict | — | `BookingConflictException` | ⚠️ Should return `409 Conflict` explicitly |
| Resource upload bad file | POST | 400 | ✅ |
| Forbidden actions | — | 403 | ✅ |
| Not found | — | 404 | ✅ |

**Minor deduction**: Booking conflict returns a runtime exception without a guaranteed `409` HTTP status code being mapped. Verify this via `@ExceptionHandler`.

---

### Code Quality — 5 Marks
**Predicted: Excellent — 5/5**

| Practice | Evidence |
|----------|----------|
| DTOs (request/response separation) | ✅ `BookingRequestDTO`, `BookingResponseDTO`, etc. |
| `@Valid` validation on requests | ✅ BookingController, TicketController |
| Lombok (`@RequiredArgsConstructor`, `@Slf4j`, `@Builder`) | ✅ |
| Interface + Implementation pattern | ✅ `BookingService` interface + `BookingServiceImpl` |
| `@Transactional` properly applied | ✅ |
| Swagger/OpenAPI annotations | ⚠️ Only BookingController has them; others missing |
| Naming conventions (Java camelCase, proper class names) | ✅ |

---

### Satisfying All Requirements — 5 Marks
**Predicted: Good — 3–4/5**

| Requirement | Status |
|-------------|--------|
| Resource CRUD with metadata | ✅ |
| Booking workflow PENDING→APPROVED/REJECTED→CANCELLED | ✅ |
| Booking conflict detection | ✅ (with `existsConflict` query) |
| Admin approve/reject with reason | ✅ `rejectionReason`, `adminNote` fields |
| User sees own bookings, admin sees all | ✅ |
| Ticket OPEN→IN_PROGRESS→RESOLVED→CLOSED/REJECTED | ✅ |
| Ticket image attachment | ⚠️ Only 1 image; spec says up to 3 |
| Technician assignment to ticket | ❌ No `assignedTechnician` field |
| Comment edit with ownership | ❌ Only delete; no PATCH comment endpoint |
| Notifications for booking/ticket events | ✅ |
| Authentication + RBAC | ✅ |

---

## 💻 CLIENT WEB APPLICATION — 15 Marks (Individual)

### Architectural Design — 5 Marks
**Predicted: Excellent — 5/5**

| Practice | Evidence |
|----------|----------|
| Zustand state management | ✅ `authStore`, `themeStore`, `catalogueUiStore`, `ticketUiStore` |
| React Query for server state | ✅ Used in FacilitiesPage, AssetsPage |
| Component modularity | ✅ Separate `components/`, `pages/`, `services/`, `store/` |
| ProtectedRoute with role guards | ✅ `allowedRoles` prop enforced |
| API service layer separation | ✅ `api.js`, `ticketApi.js`, `auth.js` |
| Responsive layout with sidebar | ✅ Collapsible sidebar |

---

### Satisfying All Requirements — 5 Marks
**Predicted: Good — 3–4/5**

| Feature | Status |
|---------|--------|
| Facilities catalogue with search/filter | ✅ |
| Asset catalogue | ✅ |
| Booking form with date/time/purpose | ✅ |
| My Bookings page | ✅ |
| Admin booking review | ✅ |
| QR code modal + verify page | ✅ |
| Ticket creation with image | ✅ |
| Ticket board (Kanban) | ✅ |
| Notification bell with panel | ✅ |
| Role-based dashboards (5 roles) | ✅ |
| Multi-image ticket upload in UI | ❌ Mirrors backend gap |
| Comment edit in UI | ❌ Only delete shown |

---

### UI/UX — 10 Marks
**Predicted: Excellent — 8–9/10**

| Quality Indicator | Evidence |
|-------------------|----------|
| Premium dark theme with CSS tokens | ✅ Full design system in `index.css` |
| Glassmorphism effects | ✅ `glass-card`, `glossy-mesh` classes |
| Smooth animations | ✅ Framer Motion throughout |
| Role-based navigation | ✅ Sidebar adapts per role |
| Responsive layout | ✅ Collapsible sidebar, responsive grids |
| Light/dark theme toggle | ✅ Persisted in localStorage |
| Toast notifications | ✅ `react-hot-toast` |
| Loading states | ✅ React Query loading states |
| Empty states | ✅ Shown in catalogues |

---

## 🔀 VERSION CONTROL — 10 Marks (Group)

### Git Usage — 5 Marks
**Predicted: Good — 3–4/5**

| Factor | Status |
|--------|--------|
| `.git` directory exists | ✅ |
| `README.md` present | ✅ |
| `.gitignore` present | ✅ |
| Active commit history | ⚠️ Cannot verify from filesystem — ensure there are meaningful, frequent commits from multiple members |
| Branching strategy | ⚠️ Unknown — avoid single `main` branch with bulk commits |

---

### GitHub Actions Workflow — 5 Marks
**Predicted: Not Acceptable — 0/5** ⛔

- No `.github/workflows/` directory found anywhere in the repository.
- This is an **automatic 0** for this criterion.
- A minimal YAML file that runs `mvn verify` takes ~15 minutes to write.

> **This is the single highest-ROI fix. Do this first.**

---

## 🔐 AUTHENTICATION — 10 Marks (Group)

**Predicted: Good → Excellent — 7–9/10**

| Feature | Evidence |
|---------|----------|
| Google OAuth 2.0 | ✅ `supabase.auth.signInWithOAuth({ provider: "google" })` in Login.jsx |
| JWT token issued after login | ✅ Supabase JWT stored in localStorage |
| JWT verified by Spring filter | ✅ `JwtAuthFilter.java` validates token |
| User synced to backend DB | ✅ `/api/auth/sync` endpoint |
| Role-based route protection (backend) | ✅ `SecurityConfig` + `@PreAuthorize` |
| Role-based route protection (frontend) | ✅ `ProtectedRoute` with `allowedRoles` |
| Session management (token refresh) | ⚠️ Relies on Supabase auto-refresh; no explicit handling in frontend |

**Deduction reason**: The `/api/tickets/**` and `/api/resources/**` endpoints are `.permitAll()` for all methods — unauthenticated users can POST/DELETE. This is a security flaw that evaluators may notice.

---

## 💡 CREATIVITY / INNOVATION — 10 Marks (Group)

**Predicted: Excellent — 8–9/10**

| Innovation | Evidence |
|------------|----------|
| **QR code check-in for approved bookings** | ✅ `QRModal.jsx` + `VerifyQRPage.jsx` + `/api/bookings/verify-qr/{token}` |
| **Admin dashboard with usage analytics** | ✅ `ReportsPage.jsx`, role-based overview dashboards |
| **Service-level timer for tickets** | ✅ `firstResponseAt` and `resolvedAt` tracked in `IncidentTicket` |
| **Audit logging** | ✅ `AuditService.java` + `AuditLog` model |
| **5-role RBAC system** | ✅ USER, ADMIN, TECHNICIAN, FACILITY_MANAGER, BOOKING_OFFICER |
| **SpaceCAD floor plan view** | ✅ `SpaceCadView.jsx` — genuine creative addition |
| **Premium Apple-inspired UI** | ✅ Dark theme, glassmorphism, Framer Motion |
| **Collapsible floating sidebar** | ✅ Full responsive implementation |

---

## 📊 Final Score Summary

| Criterion | Max | Predicted | Band |
|-----------|-----|-----------|------|
| Documentation (Group) | 15 | 10–13 | Good → Excellent |
| REST: Endpoint Naming (Ind) | 5 | **5** | Excellent |
| REST: Architecture Constraints (Ind) | 10 | 7 | Good |
| REST: HTTP Methods/Codes (Ind) | 10 | 8 | Excellent |
| REST: Code Quality (Ind) | 5 | **5** | Excellent |
| REST: Requirements (Ind) | 5 | 3–4 | Good |
| Client: Architecture (Ind) | 5 | **5** | Excellent |
| Client: Requirements (Ind) | 5 | 3–4 | Good |
| Client: UI/UX (Ind) | 10 | 8–9 | Excellent |
| Git Usage (Group) | 5 | 3–4 | Good |
| GitHub Actions (Group) | 5 | **0** | ⛔ Not Acceptable |
| OAuth 2.0 (Group) | 10 | 7–9 | Good → Excellent |
| Creativity (Group) | 10 | 8–9 | Excellent |
| **TOTAL** | **100** | **76–89** | |

---

## 🎯 Prioritised Fix List (Deadline: 27 Apr 11:45 PM)

| # | Fix | Marks Rescued | Time |
|---|-----|--------------|------|
| 🔴 **1** | Create `.github/workflows/ci.yml` | +3–5 | 20 min |
| 🔴 **2** | Fix `SecurityConfig` — restrict POST/DELETE on tickets & resources | +1–2 | 15 min |
| 🟡 **3** | Add `PATCH /api/tickets/comments/{id}` with ownership check | +1 | 30 min |
| 🟡 **4** | Add `assignedTechnician` field + `PATCH /api/tickets/{id}/assign` | +1 | 45 min |
| 🟡 **5** | Add `@Tag`/`@Operation` to TicketController + ResourceController | +0.5 | 10 min |
| 🟢 **6** | Confirm `BookingConflictException` maps to HTTP `409` | quality | 10 min |
| 🟢 **7** | Write a clear team contribution section in the PDF report | doc marks | — |
