-- ============================================================
-- SmartCampus Hub: Enterprise Database Setup (PostgreSQL)
-- Optimized for: Supabase / Spring Boot Backend
-- ============================================================

-- ── 1. INITIALIZATION ─────────────────────────────────────────
BEGIN;

-- Drop existing objects to ensure a clean state
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS incident_tickets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ── 2. GLOBAL UTILITIES ──────────────────────────────────────

-- Automatic timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ── 3. CORE TABLES ──────────────────────────────────────────

-- Users Profile Table (Public schema, mirrors Supabase Auth)
CREATE TABLE users (
    supabase_uid VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources (Facilities & Equipment)
CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- LECTURE_HALL, LAB, EQUIPMENT
    capacity INTEGER,
    location VARCHAR(255),
    availability_windows VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, OUT_OF_SERVICE
    image_url TEXT,
    -- Inventory Metadata
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Workflow
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT REFERENCES resources(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose TEXT NOT NULL,
    attendees INTEGER,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    rejection_reason VARCHAR(500),
    admin_note VARCHAR(500),
    reviewed_by VARCHAR(36),
    qr_code_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incident Management System
CREATE TABLE incident_tickets (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT REFERENCES resources(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- HARDWARE, SOFTWARE, CLEANING
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    image_url TEXT,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Collaboration
CREATE TABLE ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES incident_tickets(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE CASCADE,
    user_role VARCHAR(50),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit & Activity Logging
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asset Maintenance & Service History
CREATE TABLE maintenance_logs (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT REFERENCES resources(id) ON DELETE CASCADE,
    technician_id VARCHAR(36) REFERENCES users(supabase_uid) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL, -- REPAIR, ROUTINE_CHECK, CALIBRATION
    description TEXT,
    cost DECIMAL(12, 2),
    scheduled_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. PERFORMANCE INDEXING ──────────────────────────────────

-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Booking conflicts & filtering
CREATE INDEX idx_booking_period ON bookings(start_time, end_time);
CREATE INDEX idx_booking_resource ON bookings(resource_id);
CREATE INDEX idx_booking_user ON bookings(user_id);
CREATE INDEX idx_booking_status ON bookings(status);

-- Ticket management
CREATE INDEX idx_tickets_resource ON incident_tickets(resource_id);
CREATE INDEX idx_tickets_status ON incident_tickets(status);

-- Notification delivery
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Audit trail lookups
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);

-- Maintenance tracking
CREATE INDEX idx_maint_resource ON maintenance_logs(resource_id);
CREATE INDEX idx_maint_tech ON maintenance_logs(technician_id);

-- ── 5. TRIGGERS ──────────────────────────────────────────────

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_incident_tickets_modtime BEFORE UPDATE ON incident_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── 6. SEED DATA (ENTERPRISE SKELETON) ───────────────────────

-- Core Resources
INSERT INTO resources (name, type, capacity, location, availability_windows, image_url) VALUES
('Tesla Auditorium (L1)', 'LECTURE_HALL', 300, 'Main Tower, Ground Floor', '08:00-20:00', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205'),
('Turing Computing Lab (C1)', 'LAB', 60, 'IT Block, 1st Floor', '07:30-21:00', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12'),
('Sony A7 III 4K Camera', 'EQUIPMENT', NULL, 'Media Lab 302', '09:00-17:00', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'),
('DJI Ronin-S Gimbal Stabilizer', 'EQUIPMENT', NULL, 'Media Lab 302', '09:00-17:00', 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc'),
('MacBook Pro 16" M3', 'EQUIPMENT', NULL, 'Engineering Annex', '08:00-18:00', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8');

-- Standard Test Users (Placeholders - UUIDs should match Supabase Auth)
INSERT INTO users (supabase_uid, email, name, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'user@smartcampus.com', 'Student User', 'USER'),
('f2222222-2222-2222-2222-222222222222', 'facility@smartcampus.com', 'Facility Manager', 'FACILITY_MANAGER'),
('b3333333-3333-3333-3333-333333333333', 'booking@smartcampus.com', 'Booking Officer', 'BOOKING_OFFICER'),
('t4444444-4444-4444-4444-444444444444', 'tech@smartcampus.com', 'Technician', 'TECHNICIAN'),
('a5555555-5555-5555-5555-555555555555', 'admin@smartcampus.com', 'System Admin', 'ADMIN');

COMMIT;
-- ============================================================
