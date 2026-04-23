# Role 3: Maintenance & Ticketing Lead 🔧

## 🎯 Focus
You are responsible for **Incident tickets & Image uploads**. Your goal is to let users report broken equipment or facilities (created by Role 1), upload evidence, and let technicians manage the repair workflow.

## 💾 Database Entities
### `IncidentTicket`
- `id` (Long, Primary Key)
- `resourceId` (Long, Foreign Key to Resource)
- `userId` (Long, Foreign Key to User)
- `category` (String: `HARDWARE`, `SOFTWARE`, `CLEANING`)
- `description` (String)
- `priority` (String: `LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `status` (String/Enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`)
- `imageUrl` (String - URL from Supabase Storage)

### `TicketComment`
- `id` (Long, Primary Key)
- `ticketId` (Long, Foreign Key to IncidentTicket)
- `userId` (Long, Foreign Key to User)
- `text` (String)

## 🌐 Spring Boot API Endpoints
You must implement 4 CRUD REST endpoints in a layered architecture:

1. **POST `/api/tickets` (Submit with image)**
   - *Logic:* Accept Multipart Form-Data if uploading the image straight through Java, or accept JSON containing the `imageUrl` if uploaded directly from React to Supabase Storage Bucket.
2. **GET `/api/tickets` (Resource tickets)**
   - *Logic:* Return tickets, allow filtering by `?status=` or `?resourceId=`.
3. **PUT `/api/tickets/{id}` (Assign tech / Update status)**
   - *Logic:* Technicians update the status from `OPEN` -> `IN_PROGRESS` -> `RESOLVED`.
4. **DELETE `/api/tickets/comments/{id}` (Remove comment)**
   - *Logic:* Allow users/admins to delete a comment on a ticket. (Or DELETE `/api/tickets/{id}` to delete a ticket entirely).

## ⚛️ React Frontend Components
1. **`IncidentReportForm.jsx`**: A form to submit an issue, including a file input `<input type="file" />` for the evidence image.
2. **`TicketBoard.jsx`**: A Kanban-style board or table for Admins/Technicians to drag/move tickets from Open to Resolved.
3. **`TicketDetailsModal.jsx`**: A modal showing the image, description, and a comment thread underneath.

### State Management
Use **React Query** for all fetching to match Role 1.
**Tip for Images:** Use the Supabase JS Client directly inside your React component to upload the image to a Supabase "Storage Bucket", get the public URL natively from Supabase, and *then* `POST` that text URL to your Spring Boot API. This perfectly fulfills the complex requirements without overloading Spring Boot!