# Smart Campus Operations Hub 🎓🚀

Welcome to the **Smart Campus Operations Hub**, an enterprise-grade platform developed for the IT3030 PAF Assignment. This system serves as a central hub for managing university resources, handling bookings, resolving maintenance tickets, and securing campus operations.

## 🌟 Core Modules & Role Allocations

The development of this system is divided into four critical components, each developed as a dedicated sub-module:

1. **Role 1: Facilities & Asset Manager**
   *   Foundation of the system. Manages the complete catalog of physical resources (Lecture Halls, Labs, Equipment). Includes full CRUD operations and status tracking to ensure accurate data availability.
2. **Role 2: Booking & Scheduling Master**
   *   Handles conflict-free reservation logic. Manages booking workflows, time-slot verifications, and user requests securely.
3. **Role 3: Maintenance & Ticketing Lead**
   *   Supports incident reporting. Handles multi-part file uploads (images) and manages the assignment and resolution flow of support tickets.
4. **Role 4: Security & Notifications Specialist**
   *   The central nervous system. Manages OAuth 2.0 (Google Login), JWT handling, Role-Based Access Control (RBAC), and global system alerts.

---

## 🛠 Technology Stack

This project uses a modern, industry-standard technology stack split into a robust layered-architecture backend and a high-performance frontend.

### Frontend 
*   **Core:** React 19 + Vite + React Router v7
*   **State & Data:** Zustand (Global State) + TanStack/React Query (Server State)
*   **Styling:** Tailwind CSS v4 (Utility-first styling) & Lucide React (SVG Icons)

### Backend 
*   **Core:** Java 17 + Spring Boot 4.0.5
*   **Data & ORM:** PostgreSQL (Supabase) + Spring Data JPA
*   **Security:** Spring Security + OAuth 2.0
*   **API & Docs:** Spring WebMVC + Springdoc OpenAPI v3.0.2 (Swagger UI)

---

## 🚀 Getting Started

To run the full stack locally, you need to spin up both the backend server and the frontend development environment.

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Ensure you have Java 17 installed.
3. Run the Spring Boot application using Maven:
   ```bash
   cd backend
   .\mvnw spring-boot:run
   ```
4. The backend will start on `http://localhost:8080`.
5. *API Documentation:* Navigate to `http://localhost:8080/swagger-ui.html` for the interactive Swagger UI.

### 2. Frontend Setup
1. Navigate to the `frontend` directory.
2. Ensure you have Node.js installed.
3. Install dependencies and start the Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. The frontend will typically start on `http://localhost:5173`. 

---

## 📂 Project Documentation

Detailed system architecture planning and technology specifications can be found natively inside the [`doc/`](./doc) folder:
*   [`doc/ESSENTIAL_FEATURES.md`](./doc/ESSENTIAL_FEATURES.md) - Outlines UX features, landing pages, and application layout.
*   [`doc/TECH_STACK.md`](./doc/TECH_STACK.md) - Deep-dive into specific tools and libraries selected for the project.
*   [`ASSIGNMENT DOCS/PROJ_PLAN.md`](./ASSIGNMENT%20DOCS/PROJ_PLAN.md) - Core assignment and role breakdown.
