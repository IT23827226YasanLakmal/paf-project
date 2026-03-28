# Role 2: Booking & Scheduling Master ⏳

## 🎯 Focus
You are responsible for the **Booking workflows & Conflict prevention** logic. Your goal is to allow users to book resources created by Role 1, ensure there are no overlapping double-bookings, and allow admins to approve/reject them.

## 💾 Database Entity
### `Booking`
- `id` (Long, Primary Key)
- `resourceId` (Long, Foreign Key to Resource)
- `userId` (Long, Foreign Key to User - Mock this as `1` until Role 4 is done)
- `startTime` (LocalDateTime)
- `endTime` (LocalDateTime)
- `purpose` (String)
- `attendees` (Integer)
- `status` (String/Enum: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)

## 🌐 Spring Boot API Endpoints
You must implement exactly 4 CRUD REST endpoints in a layered architecture (`BookingController`, `BookingService`, `BookingRepository`):

1. **POST `/api/bookings` (Request Booking)**
   - *Logic:* Check if a booking already exists for `resourceId` between `startTime` and `endTime` with status `APPROVED`. If it does, throw a conflict exception. Otherwise, save as `PENDING`.
2. **GET `/api/bookings` (User Bookings / All)**
   - *Logic:* Accept `?userId=` or `?resourceId=` to filter bookings. Admin should see all, User should see their own.
3. **PATCH or PUT `/api/bookings/{id}/status` (Approve/Reject)**
   - *Logic:* Update the status. (Admin only checking required).
4. **DELETE `/api/bookings/{id}` (Remove record)**
   - *Logic:* Allow users to delete/cancel their own `PENDING` bookings.

## ⚛️ React Frontend Components
1. **`BookingForm.jsx`**: A modal or form on the `CataloguePage` that appears when a user clicks "Book Now" on a Resource Card.
2. **`MyBookingsPage.jsx`**: A page where users can see a list/table of their requested bookings and statuses.
3. **`AdminBookingReview.jsx`**: A tab/page for Admins to view incoming `PENDING` bookings and click "Approve" or "Reject".

### State Management
Use the existing **React Query** setup configured by Role 1!
- Wrap your fetch calls in `useQuery({ queryKey: ['bookings'] })`
- Make API changes using `useMutation()` and call `queryClient.invalidateQueries({ queryKey: ["bookings"] })` to auto-refresh the UI just like Role 1 did.
