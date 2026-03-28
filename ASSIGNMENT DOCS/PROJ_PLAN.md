PROJ PLAN: Smart Campus Operations Hub 🎓🚀
(IT3030 PAF Assignment)

This plan outlines our architecture, task breakdown, and role allocations.

🛠 THE TECH STACK
Backend: Java Spring Boot (Layered Architecture)
Frontend: React.js
Database: MySQL (Recommended for booking logic) - *Note: Updated to Supabase Postgres during implementation*
Security: OAuth 2.0 (Google Login) + RBAC
DevOps: GitHub Actions (CI/CD)

👥 ROLE ALLOCATION & MODULES
Each member must implement 4 CRUD endpoints + corresponding UI.

📍 Role 1: Facilities & Asset Manager
Focus: Resource Catalog (Halls, Labs, Equipment)
Endpoints: POST (Add), GET (Search/Filter), PUT (Status update), DELETE (Retire asset)
Why pick this: You build the foundation the whole system relies on.

⏳ Role 2: Booking & Scheduling Master
Focus: Booking workflows & Conflict prevention
Endpoints: POST (Request), GET (User bookings), PATCH (Approve/Reject), DELETE (Remove record)
Why pick this: Best for those who like complex logic & date/time algorithms.

🔧 Role 3: Maintenance & Ticketing Lead
Focus: Incident tickets & Image uploads
Endpoints: POST (Submit with image), GET (Resource tickets), PUT (Assign tech), DELETE (Remove comment)
Why pick this: Great for learning Multipart file handling & entity relationships.

🔐 Role 4: Security & Notifications Specialist
Focus: Auth (OAuth 2.0) & System Alerts
Endpoints: POST (Google Login/JWT), GET (Notifications), PUT (Role assignment), DELETE (Dismiss alert)
Why pick this: Ideal for those interested in App Security & Cross-cutting logic.

💡 CREATIVITY MARKS (Innovation)
✅ QR Code check-in for bookings
✅ Admin Analytics Dashboard (Charts)
✅ Service-level timers for tickets

🧪 VERIFICATION PLAN
Automated: JUnit tests for Controllers/Logic.
Manual: Postman/Swagger for APIs + React UI flow testing.
