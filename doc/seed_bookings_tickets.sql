-- ============================================================
-- SmartCampus Hub: Seed Data (Bookings & Incident Tickets)
-- ============================================================

BEGIN;

-- ── 0. ENSURE USER EXISTS ─────────────────────────────────────
-- Ensuring the target user exists to satisfy foreign key constraints
INSERT INTO users (supabase_uid, email, name, role) 
VALUES ('b1007d17-1bc3-4f91-9974-09d3d5a18818', 'current_user@smartcampus.com', 'Active User', 'USER')
ON CONFLICT (supabase_uid) DO NOTHING;

-- Clear existing seed data to prevent duplicates
DELETE FROM ticket_comments;
DELETE FROM incident_tickets;
DELETE FROM bookings;

-- ── 1. SEED BOOKINGS ──────────────────────────────────────────
-- Real Resource IDs from Supabase:
-- 22: Sony A7 III 4K Camera
-- 23: DJI Ronin-S Gimbal Stabilizer
-- 24: MacBook Pro 16" M3 Max
-- 25: Tesla Auditorium (L1)
-- 26: Turing Computing Lab (C1)

INSERT INTO bookings (resource_id, user_id, start_time, end_time, purpose, attendees, status, admin_note, rejection_reason, qr_code_token) VALUES
-- Past Bookings (Completed/Approved)
((SELECT id FROM resources WHERE name LIKE '%Tesla Auditorium%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Introduction to Quantum Computing Seminar', 150, 'APPROVED', 'Setup verified by facility team.', NULL, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
((SELECT id FROM resources WHERE name LIKE '%Turing Computing Lab%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Late Night Coding Marathon', 25, 'APPROVED', 'Extended access granted for hackathon prep.', NULL, 'a12bc34d-56ef-78gh-90ij-klmnopqrstuv'),

-- Current/Future Bookings
((SELECT id FROM resources WHERE name LIKE '%Tesla Auditorium%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours', 'Department Monthly Assembly', 200, 'PENDING', NULL, NULL, NULL),
((SELECT id FROM resources WHERE name LIKE '%Sony A7%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days 4 hours', 'Short Film Production - Scene 4', 5, 'APPROVED', 'Please collect from Media Lab 302.', NULL, 'b23cd45e-67fg-89hi-01jk-lmnoPQRSTUVW'),
((SELECT id FROM resources WHERE name LIKE '%MacBook Pro%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '5 hours', CURRENT_TIMESTAMP + INTERVAL '8 hours', 'Senior Project Development', 1, 'APPROVED', 'Standard equipment loan.', NULL, 'c34de56f-78gh-90ij-12kl-mnopqrstuvwX'),
((SELECT id FROM resources WHERE name LIKE '%DJI Ronin-S%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '10 hours', CURRENT_TIMESTAMP + INTERVAL '14 hours', 'B-Roll Cinematography Session', 2, 'APPROVED', 'Handle with care.', NULL, 'd45ef67g-89hi-01jk-23lm-nopqrstuvwxY'),

-- Rejected/Cancelled
((SELECT id FROM resources WHERE name LIKE '%Turing Computing Lab%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '3 days 2 hours', 'Private Gaming Session', 10, 'REJECTED', 'Policy violation.', 'Lab resources are reserved for academic purposes only.', NULL),
((SELECT id FROM resources WHERE name LIKE '%Tesla Auditorium%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '4 days 2 hours', 'Canceled Workshop', 50, 'CANCELLED', 'User requested cancellation.', NULL, NULL);


-- ── 2. SEED INCIDENT TICKETS ──────────────────────────────────
INSERT INTO incident_tickets (resource_id, user_id, category, description, priority, status, image_url, first_response_at, resolved_at) VALUES
-- Active Tickets
((SELECT id FROM resources WHERE name LIKE '%Turing Computing Lab%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'HARDWARE', 'Workstation #12 has a flickering monitor. Needs replacement.', 'MEDIUM', 'OPEN', 'https://images.unsplash.com/photo-1587202392491-304e73bea102', NULL, NULL),
((SELECT id FROM resources WHERE name LIKE '%Tesla Auditorium%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'ELECTRICAL', 'Main projector in Tesla Auditorium is overheating and shutting down.', 'HIGH', 'IN_PROGRESS', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c', CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL),
((SELECT id FROM resources WHERE name LIKE '%Sony A7%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'SOFTWARE', 'Memory card error on Sony Camera. Requires formatting/repair.', 'LOW', 'OPEN', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', NULL, NULL),
((SELECT id FROM resources WHERE name LIKE '%MacBook Pro%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'HARDWARE', 'Trackpad on MacBook Annex-4 is unresponsive.', 'MEDIUM', 'IN_PROGRESS', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL),

-- Resolved Tickets
((SELECT id FROM resources WHERE name LIKE '%Turing Computing Lab%'), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'NETWORKING', 'Ethernet port C-04 fixed. Replaced damaged cable.', 'LOW', 'RESOLVED', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour');


-- ── 3. SEED TICKET COMMENTS ──────────────────────────────────
INSERT INTO ticket_comments (ticket_id, user_id, user_role, text) VALUES
((SELECT id FROM incident_tickets WHERE description LIKE 'Workstation #12%' LIMIT 1), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'USER', 'It started happening about an hour into my session.'),
((SELECT id FROM incident_tickets WHERE description LIKE 'Main projector%' LIMIT 1), 'b1007d17-1bc3-4f91-9974-09d3d5a18818', 'USER', 'The projector is critical for tomorrow morning''s keynote. Please prioritize.');

COMMIT;
-- ============================================================
