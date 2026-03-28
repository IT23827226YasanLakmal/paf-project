# Comprehensive Technology Stack

This document details the complete technology stack used to build the **Smart Campus Operations Hub**, categorizing both frontend and backend technologies, inclusive of all major libraries and tools.

## 1. Backend Architecture (Java / Spring Boot)
The backend is built using a modern Java stack featuring layered architecture (Controller, Service, Repository patterns).

*   **Core Framework:** Java 17 + Spring Boot 4.0.5
*   **Web Layer:** Spring WebMVC (REST APIs)
*   **Data Access (ORM):** Spring Data JPA
*   **Database:** PostgreSQL (Hosted on Supabase)
*   **API Documentation:** Springdoc OpenAPI v3.0.2 (Swagger UI) 
    *   *Exposes interactive documentation at `/swagger-ui.html` and `/v3/api-docs`.*
*   **Validation:** Spring Boot Starter Validation (Jakarta Bean Validation)
*   **Boilerplate Reduction:** Project Lombok
*   **Build Tool:** Maven

## 2. Frontend Architecture (React.js / Vite)
The frontend relies on a modern, high-performance React ecosystem.

*   **Core Framework:** React.js 19
*   **Build Tool:** Vite 5.4.11 (Extremely fast HMR and optimized builds)
*   **Routing:** React Router DOM v7 (Client-side routing)
*   **Data Management & Fetching:** React Query (TanStack Query v5)
    *   *Handles server-state caching, loading states, and automatic refetching.*
*   **Global State Management:** Zustand v5
    *   *Manages client-side state (e.g., UI Theme, User Auth State) without the boilerplate of Redux.*
*   **Styling & UI:** Tailwind CSS v4.2
    *   *Powered by the `@tailwindcss/vite` plugin for lightning-fast, utility-first styling.*
*   **Icons:** Lucide React (Clean, consistent SVG icon library)

## 3. DevOps & Security
*   **Authentication & Authorization:** OAuth 2.0 (Google Login Integration) + Role-Based Access Control (RBAC)
*   **Version Control:** Git & GitHub
*   **CI/CD Pipeline:** GitHub Actions (Automated testing and deployment workflows)
*   **Code Quality (Frontend):** ESLint 9 + Globals
