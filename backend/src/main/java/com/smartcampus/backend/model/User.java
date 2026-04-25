package com.smartcampus.backend.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Represents the application-level user profile.
 *
 * Identity & authentication are handled by Supabase Auth (auth.users table).
 * This entity stores ONLY profile/role data that our backend needs.
 *
 * Primary key: supabase_uid (UUID) — mirrors auth.users.id, so there is a
 * 1-to-1 relationship without any foreign-key duplication.
 *
 * Columns intentionally omitted vs. the old model:
 *   - password  → Supabase Auth owns credentials, not us.
 *   - id (Long) → replaced by the Supabase UUID to avoid a second surrogate key.
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {

    /**
     * Mirrors auth.users.id from Supabase.
     * Stored as VARCHAR(36) to hold UUID strings.
     * Not auto-generated — Supabase supplies it on sign-up.
     */
    @Id
    @Column(name = "supabase_uid", length = 36, nullable = false, updatable = false)
    private String supabaseUid;

    /** Kept for display / lookup — Supabase also stores this, but having it
     *  here avoids a round-trip to Supabase for every API call. */
    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ── Constructors ──────────────────────────────────────────────────────────

    public User() {}

    public User(String supabaseUid, String email, String name, Role role) {
        this.supabaseUid = supabaseUid;
        this.email       = email;
        this.name        = name;
        this.role        = role;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    // Legacy getter for frontend compatibility
    public String getId() { return supabaseUid; }

    public String getSupabaseUid() { return supabaseUid; }
    public void   setSupabaseUid(String supabaseUid) { this.supabaseUid = supabaseUid; }

    public String getEmail() { return email; }
    public void   setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void   setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    // ── Spring Security (UserDetails) ─────────────────────────────────────────
    // We use supabaseUid as the "username" because JWTs issued by Supabase
    // contain the UUID as the `sub` claim, which our JWT filter reads.

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Not used — Supabase owns the password. Returns empty string for safety. */
    @Override
    public String getPassword() { return ""; }

    /** The JWT `sub` claim is the Supabase UUID — use that as the username. */
    @Override
    public String getUsername() { return supabaseUid; }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
