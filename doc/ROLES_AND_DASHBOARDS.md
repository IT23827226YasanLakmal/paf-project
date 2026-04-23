# Roles & Dashboards Organization 📋

This document outlines the recommended naming conventions and organizational structure for user roles and their corresponding dashboards within the **Smart Campus Operations Hub**.

## 👥 Role & Dashboard Mapping

To ensure professional naming and clear separation of concerns, the following mapping is recommended for the 4 core modules:

| Project Module | System Role Name | Dashboard Name | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Role 1: Facilities & Assets** | `FACILITY_MANAGER` | **Facilities Hub** | Managing rooms, labs, and physical assets. |
| **Role 2: Bookings** | `BOOKING_OFFICER` | **Reservations Desk** | Overseeing schedules and approving bookings. |
| **Role 3: Maintenance** | `TECHNICIAN` | **Maintenance Portal** | Resolving tickets and updating repair statuses. |
| **Role 4: Security & Admin** | `SYSTEM_ADMIN` | **Admin Control Center** | User roles, security, and system-wide analytics. |

---

## 🛠 Backend Implementation (`Role.java`)

The current `Role` enum should be expanded to accommodate these specific permissions. This allows for fine-grained **Role-Based Access Control (RBAC)**.

```java
public enum Role {
    USER,               // Standard Student/Staff (View only / Request bookings)
    FACILITY_MANAGER,   // Full control over Resource Catalog
    BOOKING_OFFICER,    // Can approve/reject booking requests
    TECHNICIAN,         // Can manage maintenance tickets
    SYSTEM_ADMIN        // Global settings, security, and analytics
}
```

---

## 💻 Frontend UI Architecture

Instead of building separate applications for each role, use a **Unified Dashboard** structure with conditional navigation.

### Navigation Logic
- **Common View:** Every logged-in user sees the *Resource Catalogue*.
- **Role-Based Links:**
    - `FACILITY_MANAGER` sees "Add/Edit Assets" in their sidebar.
    - `TECHNICIAN` sees "Open Tickets" and "My Assignments."
    - `SYSTEM_ADMIN` sees "User Management" and "System Health."

### Dashboard Components
1.  **Admin Dashboard (Role 4):** Should feature high-level charts (e.g., "Most Booked Room," "Active Tickets Count").
2.  **Support Dashboard (Role 3):** A list-heavy view for managing incident reports and image uploads.
3.  **Operations Dashboard (Role 1):** The current `CataloguePage` enhanced with bulk update features.

---

## 🚀 Creativity Marks (Innovation)
- **Unified Analytics:** A central dashboard for the `SYSTEM_ADMIN` that aggregates data from all other modules.
- **Role Switching:** (For testing purposes) A way for developers to quickly switch between roles to see different dashboard views.
