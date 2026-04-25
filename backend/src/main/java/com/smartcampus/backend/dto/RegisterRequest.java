package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.Role;

public class RegisterRequest {
    private String supabaseUid; // Added to capture UUID from Supabase
    private String name;
    private String email;
    private String password;
    private Role role;

    public RegisterRequest() {}

    public String getSupabaseUid() { return supabaseUid; }
    public void setSupabaseUid(String supabaseUid) { this.supabaseUid = supabaseUid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
