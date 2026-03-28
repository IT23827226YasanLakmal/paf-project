# Role 4: Security & Notifications Specialist 🔐

## 🎯 Focus
You are responsible for **Auth (OAuth 2.0) & System Alerts**. Your goal is to secure the API endpoints built by Roles 1, 2, and 3, provide Google Login, and alert users when bookings are approved or tickets update.

## 💾 Database Entities
### `User`
- `id` (Long, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `role` (String/Enum: `USER`, `ADMIN`, `TECHNICIAN`)
- `oauthProviderId` (String - Google Sub ID)

### `Notification`
- `id` (Long, Primary Key)
- `userId` (Long, Foreign Key to User)
- `message` (String)
- `isRead` (Boolean)
- `createdAt` (LocalDateTime)

## 🌐 Spring Boot API Endpoints
You must implement 4 CRUD REST endpoints:

1. **POST `/api/auth/login` (Google Login/JWT)**
   - *Logic:* Receive Google OAuth token from the frontend, verify it using Google API Client in Java, check if User exists, save them if new, and return a custom JWT token.
2. **GET `/api/notifications` (Alerts)**
   - *Logic:* Fetch all notifications for the currently authenticated User based on their JWT token.
3. **PUT `/api/users/{id}/role` (Role assignment)**
   - *Logic:* Admin-only endpoint to promote a `USER` to an `ADMIN` or `TECHNICIAN`.
4. **DELETE `/api/notifications/{id}` (Dismiss alert)**
   - *Logic:* Delete a notification once the user clicks an "X" or "Dismiss" button.

### 🛡 Spring Security
Add `spring-boot-starter-security`. Secure `/api/resources` (Role 1) so only ADMINs can POST/PUT/DELETE, but anyone can GET. Secure `/api/bookings` (Role 2) so logic restricts updates to owners/admins.

## ⚛️ React Frontend Components
1. **`Login.jsx`**: A public login page featuring a "Sign in with Google" button (use `@react-oauth/google`).
2. **`NotificationBell.jsx`**: A bell icon in the navigation bar that lights up red when `unreadCount > 0`. Clicking it drops down a list of alerts.
3. **`AdminUserRoles.jsx`**: A dashboard table displaying registered users with a dropdown to change their Roles.

### State Management (Crucial)
Modify Role 1's mock `authStore.js` (Zustand). Instead of hardcoded data, make `login()` save the real JWT token to `localStorage` and set the real User object globally.
You must also update `api.js` (or rewrite it to use Axios Interceptors) to automatically attach `Authorization: Bearer <token>` to every fetch request going to the Spring Boot API!
