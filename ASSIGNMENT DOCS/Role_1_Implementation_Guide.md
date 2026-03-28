# Role 1: Facilities & Asset Manager 🏢

## 🎯 Focus
You are responsible for the **Resource Catalog (Halls, Labs, Equipment)**. Your goal is to build the foundation that the whole system relies on, allowing Admins to add, manage, and optionally retire university facilities and assets.

## 💾 Database Entities
### `Resource`
- `id` (Long, Primary Key)
- `name` (String)
- `type` (String/Enum: `LECTURE_HALL`, `LAB`, `EQUIPMENT`)
- `capacity` (Integer - Nullable for equipment)
- `location` (String)
- `availabilityWindows` (String - e.g. '08:00 - 17:00')
- `status` (String/Enum: `ACTIVE`, `OUT_OF_SERVICE`)

## 🌐 Spring Boot API Endpoints
You must implement 4 CRUD REST endpoints in a layered architecture (`ResourceController`, `ResourceService`, `ResourceRepository`):

1. **POST `/api/resources` (Add)**
   - *Logic:* Create a new Resource. Validate that name, type, and status are provided.
2. **GET `/api/resources` (Search/Filter)**
   - *Logic:* Return a list of all resources. Accept an optional query parameter `?type=` to filter by LECTURE_HALL, LAB, or EQUIPMENT.
3. **PUT `/api/resources/{id}` (Status update / Edit)**
   - *Logic:* Update the details or status (e.g., set an asset to `OUT_OF_SERVICE`) of an existing resource.
4. **DELETE `/api/resources/{id}` (Retire asset)**
   - *Logic:* Delete the resource from the database. (If bookings rely on it, you might throw an error or handle cascading).

## ⚛️ React Frontend Components
1. **`CataloguePage.jsx`**: A main dashboard displaying all resources in a grid, with a dropdown to filter by `type`.
2. **`ResourceCard.jsx`**: A card component showing the resource name, type, capacity, and current status. Include a "Toggle Status" button.
3. **`ResourceForm.jsx`**: A modal or form to collect `name`, `type`, `capacity`, and `location` to create a new resource.

### State Management & Notes
- Use **React Query** (`useQuery`, `useMutation`) to cache the catalog list and automatically refresh the dashboard when an item is added, updated, or deleted. 
- *Note:* This role is the backbone of the application. Roles 2 and 3 depend heavily on the `id` of what you create!
