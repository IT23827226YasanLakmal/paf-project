package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.service.ResourceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ResourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ResourceService resourceService;

    @Test
    @DisplayName("Should successfully upload an image via the Multipart API")
    void testImageUpload() throws Exception {
        // 1. Create a dummy resource first
        ResourceDTO dto = new ResourceDTO();
        dto.setName("Integration Test Lab");
        dto.setType("LAB");
        dto.setStatus("ACTIVE");
        ResourceDTO created = resourceService.createResource(dto);
        Long id = created.getId();

        // 2. Prepare mock file
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_upload.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image data".getBytes());

        // 3. Execute POST via MockMvc
        mockMvc.perform(multipart("/api/resources/" + id + "/image")
                .file(file))
                .andExpect(status().isOk());

        // 4. Verification
        ResourceDTO updated = resourceService.getResourceById(id);
        assertNotNull(updated.getImageUrl());
        assertTrue(updated.getImageUrl().contains("/uploads/"));
    }
}
