# Developer Guide: Getting Started 🚀

Welcome to the **Smart Campus Operations Hub** development team! This guide will walk you through setting up your local environment so you can start contributing to the frontend and backend architectures.

---

## 🛠 1. Prerequisites
Before you start, ensure you have the following installed on your machine:
*   **Java 17+** (Required for Spring Boot 4.x)
*   **Node.js 20+** (Required for Vite and React 19)
*   **Git** (For version control)
*   *Recommended IDEs:* IntelliJ IDEA (Backend) and VS Code (Frontend)

---

## 🖥 2. Backend Setup (Spring Boot)

The API is structured as a monolithic Spring Boot application using Maven.

### Step 2.1: Configuration
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Locate the database configuration file at `src/main/resources/application.properties`.
3. Ensure the Supabase (Postgres) credentials or your local MySQL/Postgres credentials are correct. *Note: Never commit secret API keys or database passwords to GitHub!*

### Step 2.2: Running the Server
1. From the `backend` terminal, build and run the application using the Maven wrapper:
   ```bash
   # Windows
   .\mvnw spring-boot:run
   
   # Mac/Linux
   ./mvnw spring-boot:run
   ```
2. The server will start on port `8080` (by default).

### Step 2.3: Exploring the API
Once the server is running, you can explore and test all available endpoints dynamically via our auto-generated Swagger UI:
👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

---

## 🎨 3. Frontend Setup (React + Vite)

Our frontend is a lightning-fast Single Page Application (SPA) powered by Vite, Zustand, and Tailwind CSS v4.

### Step 3.1: Package Installation
1. Open a *new* terminal split and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```

### Step 3.2: Running the Dev Server
1. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
2. The application will be accessible at 👉 **[http://localhost:5173](http://localhost:5173)** (or `5174` if `5173` is busy).

---

## 💡 4. Typical Development Workflow

If you are developing full-stack features (e.g., adding a new endpoint and hooking it up to the UI), your terminal setup should look like this:
*   **Terminal 1:** Running `.\mvnw spring-boot:run`
*   **Terminal 2:** Running `npm run dev`
*   **Terminal 3:** Free for Git commands (e.g., `git status`, `git commit`)

### Key Notes for Developers:
*   **Frontend Routing:** All routing logic is handled by `react-router-dom` in `src/App.jsx` or `src/main.jsx`.
*   **Styling:** We use Tailwind CSS v4. Do not write custom CSS in `.css` files unless absolutely necessary.
*   **API Calls:** Use TanStack React Query to fetch data from the backend. Base URLs logic should point to `http://localhost:8080/api/`.
