-- ============================================================
-- SmartCampus Resource Seed Script
-- Execute directly via Supabase SQL Editor
-- Safe: Wrapped in a transaction with CASCADE cleanup
-- ============================================================

BEGIN;

-- 1. Clean all dependent tables first (cascade order)
DELETE FROM bookings;
DELETE FROM notifications;
DELETE FROM resources;

-- 2. Seed Equipment
INSERT INTO resources (name, type, capacity, location, availability_windows, status, image_url)
VALUES
('Sony A7 III 4K Camera', 'EQUIPMENT', NULL, 'Main Media Lab, Room 302', '09:00 - 17:00', 'ACTIVE', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'),
('DJI Ronin-S Gimbal Stabilizer', 'EQUIPMENT', NULL, 'Main Media Lab, Room 302', '09:00 - 17:00', 'ACTIVE', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'),
('Oculus Quest 3 VR Headset', 'EQUIPMENT', NULL, 'VR Research Suite, L4', '08:00 - 18:00', 'ACTIVE', 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=600&q=80'),
('MacBook Pro 16" M3 Max', 'EQUIPMENT', NULL, 'Software Engineering Studio', '08:00 - 20:00', 'ACTIVE', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'),
('Arduino Sensor Master Kit', 'EQUIPMENT', NULL, 'IoT Prototyping Workshop', '09:00 - 16:00', 'ACTIVE', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80'),
('Rode NT-USB Condenser Mic', 'EQUIPMENT', NULL, 'Podcast Recording Booth', '10:00 - 18:00', 'ACTIVE', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80'),

-- 3. Seed Facilities
('Tesla Auditorium (L1)', 'LECTURE_HALL', 300, 'Main Tower, Ground Floor', '08:00 - 20:00', 'ACTIVE', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80'),
('Curie Lecture Theatre (L4)', 'LECTURE_HALL', 120, 'Science Wing, 4th Floor', '08:00 - 18:00', 'ACTIVE', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80'),
('Turing Computing Lab (C1)', 'LAB', 60, 'IT Block, 1st Floor', '07:30 - 21:00', 'ACTIVE', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'),
('Edison Electronics Workshop', 'LAB', 45, 'Engineering Annex, Room 102', '09:00 - 17:30', 'ACTIVE', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80'),
('Collaborative Hub', 'LAB', 30, 'Student Commons, Level 2', '24 Hours', 'ACTIVE', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80');

COMMIT;
