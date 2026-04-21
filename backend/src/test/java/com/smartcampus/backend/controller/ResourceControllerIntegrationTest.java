package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.service.ResourceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
public class ResourceControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ResourceService resourceService;

    @Test
    @DisplayName("Should successfully upload an image via the Multipart API")
    void testImageUpload() throws IOException {
        // 1. Create a dummy resource first
        ResourceDTO dto = new ResourceDTO();
        dto.setName("Integration Test Lab");
        dto.setType("LAB");
        dto.setStatus("ACTIVE");
        ResourceDTO created = resourceService.createResource(dto);
        Long id = created.getId();

        // 2. Prepare mock file
        File tempFile = File.createTempFile("test_upload", ".jpg");
        Files.write(tempFile.toPath(), "fake image data".getBytes());

        // 3. Prepare Multipart request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(tempFile));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 4. Execute POST
        String url = "http://localhost:" + port + "/api/resources/" + id + "/image";
        ResponseEntity<ResourceDTO> response = restTemplate.postForEntity(url, requestEntity, ResourceDTO.class);

        // 5. Assertions
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getImageUrl().contains("/uploads/"));
        
        // Cleanup
        tempFile.delete();
    }
}
