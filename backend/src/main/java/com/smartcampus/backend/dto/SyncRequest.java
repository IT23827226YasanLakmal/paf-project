package com.smartcampus.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncRequest {
    private String email;
    private String name;
    private String supabaseUid;
}
