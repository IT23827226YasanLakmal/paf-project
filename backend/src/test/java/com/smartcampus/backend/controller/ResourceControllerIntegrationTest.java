package com.smartcampus.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.service.ResourceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/resources should return list of resources")
    void shouldReturnResourcesList() throws Exception {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(1L);
        dto.setName("Main Lab");
        dto.setType("LAB");
        dto.setStatus("ACTIVE");

        when(resourceService.getAllResources(null)).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Main Lab"))
                .andExpect(jsonPath("$[0].type").value("LAB"));
    }

    @Test
    @DisplayName("POST /api/resources should create a resource")
    void shouldCreateResource() throws Exception {
        ResourceDTO inputDto = new ResourceDTO();
        inputDto.setName("New Lab");
        inputDto.setType("LAB");
        inputDto.setStatus("ACTIVE");

        ResourceDTO savedDto = new ResourceDTO();
        savedDto.setId(1L);
        savedDto.setName("New Lab");
        savedDto.setType("LAB");
        savedDto.setStatus("ACTIVE");

        when(resourceService.createResource(any(ResourceDTO.class))).thenReturn(savedDto);

        mockMvc.perform(post("/api/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("New Lab"));
    }

    @Test
    @DisplayName("DELETE /api/resources/{id} should return no content")
    void shouldDeleteResource() throws Exception {
        mockMvc.perform(delete("/api/resources/1"))
                .andExpect(status().isNoContent());
    }
}
