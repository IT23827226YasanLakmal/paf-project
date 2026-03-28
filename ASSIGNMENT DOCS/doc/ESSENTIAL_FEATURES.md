# Essential System Features & Architecture

This document outlines the core structural and UX features required to make the Smart Campus Operations Hub a complete, production-ready system beyond the basic CRUD endpoints.

## 1. The Entry Point: Landing Page & Auth Flow
*   **Public Landing Page:** A polished introduction page explaining the Hub's purpose with a primary Call-to-Action (CTA): **"Login with Google"**.
*   **Authentication State Handling:** Secure routing that intercepts unauthenticated users, handles the OAuth callback, and redirects the user to their specific dashboard based on their Role (RBAC).

## 2. Role-Based Dashboards
Personalized "Command Centers" for different users:
*   **Admin/Staff Dashboard:** High-level analytics holding charts for "Most Booked Resources", "Open Maintenance Tickets", and "System Alerts".
*   **Student/User Dashboard:** A personalized view showing "My Upcoming Bookings", "My Active Tickets", and recent notifications.

## 3. Global Application Shell (Layout Structure)
*   **Persistent Navigation:** A responsive Sidebar or Top Navbar that dynamically hides/shows links based on the user's Role (RBAC).
*   **User Profile Menu:** A dropdown showing the user's Google Profile Picture, Name, Role, and a global "Log Out" button.
*   **Dynamic Breadcrumbs:** Navigation aids to help users traverse deep into the app (e.g., *Home > Resources > Electronics Lab > Book*).

## 4. Global UX & Feedback Systems
*   **Toast Notifications (Snackbars):** A centralized notification system to show success/error messages for all actions across all 4 modules (e.g., "Resource Added Successfully!").
*   **Skeleton Loaders / Spinners:** Shimmering placeholders mapping the layout structure while React fetches data from the Spring Boot backend.
*   **Custom Error Pages:** 
    *   **404 Not Found:** A styled fallback page for invalid URLs.
    *   **403 Unauthorized:** A fallback page for when a user attempts to access a route or perform an action beyond their Role's permissions.

## 5. Cross-Cutting "Nice-to-Haves" (High Polish)
*   **Dark/Light Mode Theme:** A modern UI requirement that significantly enhances the application's aesthetic polish.
*   **Global Search Bar:** A universal search input in the top navigation allowing quick lookups for Resources, Ticket IDs, or User Bookings.
