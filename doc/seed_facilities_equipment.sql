-- ============================================================
-- Seed Data for Facilities & Equipment
-- Buildings: Main Building & New Building
-- ============================================================

-- Clean up existing resources if needed
-- DELETE FROM resources WHERE location LIKE 'Main Building%' OR location LIKE 'New Building%';

INSERT INTO resources (name, type, capacity, location, availability_windows, status, serial_number, image_url) VALUES
-- ── MAIN BUILDING ──────────────────────────────────────────

-- 1st Floor
('Visitor Lounge & Reception', 'LOUNGE', 50, 'Main Building, 1st Floor', '08:00-18:00', 'ACTIVE', 'SN-MB-102', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'),

-- 2nd Floor
('Esports Arena & Gaming Room', 'LAB', 40, 'Main Building, 2nd Floor', '09:00-21:00', 'ACTIVE', 'SN-MB-201', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'),
('Indoor Sports Pavilion', 'SPORTS_PAVILION', 60, 'Main Building, 2nd Floor', '08:00-22:00', 'ACTIVE', 'SN-MB-202', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'),

-- 3rd Floor
('Central Library Study Zone', 'LIBRARY', 120, 'Main Building, 3rd Floor', '08:00-22:00', 'ACTIVE', 'SN-MB-301', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'),
('Physics Experimental Lab', 'LAB', 30, 'Main Building, 3rd Floor', '08:00-17:00', 'ACTIVE', 'SN-MB-302', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),

-- 4th Floor
('Lecture Hall A401', 'LECTURE_HALL', 100, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'SN-MB-401', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Lecture Hall B402', 'LECTURE_HALL', 100, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'SN-MB-402', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Chemistry & Biochemistry Lab', 'LAB', 35, 'Main Building, 4th Floor', '08:00-17:00', 'ACTIVE', 'SN-MB-403', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),

-- 5th Floor
('Lecture Hall A501', 'LECTURE_HALL', 120, 'Main Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'SN-MB-501', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Advanced Computing Lab A502', 'LAB', 50, 'Main Building, 5th Floor', '07:30-21:00', 'ACTIVE', 'SN-MB-502', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),

-- 6th Floor
('Lecture Hall B601', 'LECTURE_HALL', 120, 'Main Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'SN-MB-601', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Biology & Genetics Lab B602', 'LAB', 35, 'Main Building, 6th Floor', '08:00-17:00', 'ACTIVE', 'SN-MB-602', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),

-- 7th Floor
('Lecture Hall A701', 'LECTURE_HALL', 80, 'Main Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'SN-MB-701', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Faculty Meeting Room B702', 'MEETING_ROOM', 30, 'Main Building, 7th Floor', '08:00-18:00', 'ACTIVE', 'SN-MB-702', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'),

-- 8th Floor
('Dean''s Boardroom', 'MEETING_ROOM', 25, 'Main Building, 8th Floor', '08:00-18:00', 'ACTIVE', 'SN-MB-801', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'),


-- ── NEW BUILDING ───────────────────────────────────────────

-- 1st Floor
('Modern Digital Library', 'LIBRARY', 150, 'New Building, 1st Floor', '08:00-22:00', 'ACTIVE', 'SN-NB-102', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'),

-- 2nd Floor
('Grand Auditorium N201', 'AUDITORIUM', 300, 'New Building, 2nd Floor', '08:00-21:00', 'ACTIVE', 'SN-NB-201', 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&w=800&q=80'),
('Robotics & Mechatronics Lab N202', 'LAB', 40, 'New Building, 2nd Floor', '08:00-18:00', 'ACTIVE', 'SN-NB-202', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),

-- 3rd Floor
('Mega Collaborative Study Hall', 'STUDY_HALL', 200, 'New Building, 3rd Floor', '00:00-24:00', 'ACTIVE', 'SN-NB-301', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'),

-- 4th Floor
('Lecture Hall N401', 'LECTURE_HALL', 100, 'New Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-401', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
('Advanced Electronics Lab N402', 'LAB', 30, 'New Building, 4th Floor', '08:00-17:00', 'ACTIVE', 'SN-NB-402', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),

-- 5th Floor (Cyber Security)
('Cyber Defense Operations Lab', 'LAB', 45, 'New Building, 5th Floor', '08:00-22:00', 'ACTIVE', 'SN-NB-501', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'),
('Ethical Hacking Theatre N502', 'LECTURE_HALL', 80, 'New Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-502', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),

-- 6th Floor (Data Science & AI)
('AI Research & Machine Learning Lab', 'LAB', 50, 'New Building, 6th Floor', '08:00-22:00', 'ACTIVE', 'SN-NB-601', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),
('Data Analytics Hall N602', 'LECTURE_HALL', 120, 'New Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-602', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),

-- 7th Floor (Software Engineering & IS)
('DevOps & Cloud Computing Lab', 'LAB', 40, 'New Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-701', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),
('Enterprise Systems Hall N702', 'LECTURE_HALL', 90, 'New Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-702', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),

-- 8th Floor (Networking & IT)
('Cisco Networking Academy Lab', 'LAB', 40, 'New Building, 8th Floor', '08:00-17:00', 'ACTIVE', 'SN-NB-801', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),
('Information Technology Hall N802', 'LECTURE_HALL', 100, 'New Building, 8th Floor', '08:00-20:00', 'ACTIVE', 'SN-NB-802', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),


-- ── EQUIPMENT ──────────────────────────────────────────────

('Sony A7 III 4K Camera Kit', 'EQUIPMENT', NULL, 'New Building, 1st Floor', '09:00-17:00', 'ACTIVE', 'EQ-NB-101', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'),
('High-Performance GPU Server Node', 'EQUIPMENT', NULL, 'New Building, 6th Floor', '00:00-24:00', 'ACTIVE', 'EQ-NB-601', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'),
('Cisco Catalyst Switch Rack', 'EQUIPMENT', NULL, 'New Building, 8th Floor', '00:00-24:00', 'ACTIVE', 'EQ-NB-801', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'),
('VR Quest 3 Headset Bundle (x10)', 'EQUIPMENT', NULL, 'New Building, 5th Floor', '08:00-18:00', 'ACTIVE', 'EQ-NB-501', 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80'),
('Smart Podium with Dual Display', 'EQUIPMENT', NULL, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-MB-401', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('Digital Forensic Workstation', 'EQUIPMENT', NULL, 'New Building, 5th Floor', '08:00-22:00', 'MAINTENANCE', 'EQ-NB-502', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),
('3D Printer Farm Node A', 'EQUIPMENT', NULL, 'New Building, 2nd Floor', '08:00-18:00', 'OUT_OF_ORDER', 'EQ-NB-201', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80');


-- ── AUTOMATED INFRASTRUCTURE (Projectors & Smart Boards) ──

INSERT INTO resources (name, type, capacity, location, availability_windows, status, serial_number, image_url) VALUES
-- Projectors for Lecture Halls
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 1st Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-102', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 2nd Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-202', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 3rd Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-301', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-401', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-402', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-501', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-601', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-701', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-702', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'Main Building, 8th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-MB-801', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 1st Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-102', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 2nd Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-201', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 3rd Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-301', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-401', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-502', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-602', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-702', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),
('4K Overhead Projector', 'EQUIPMENT', NULL, 'New Building, 8th Floor', '08:00-20:00', 'ACTIVE', 'EQ-PROJ-NB-802', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'),

-- Smart Boards for Labs
('Interactive Smart Board', 'EQUIPMENT', NULL, 'Main Building, 2nd Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-MB-201', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'Main Building, 3rd Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-MB-302', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'Main Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-MB-403', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'Main Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-MB-502', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'Main Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-MB-602', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 2nd Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-202', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 4th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-402', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 5th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-501', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 6th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-601', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 7th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-701', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('Interactive Smart Board', 'EQUIPMENT', NULL, 'New Building, 8th Floor', '08:00-20:00', 'ACTIVE', 'EQ-SBRD-NB-801', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80');
