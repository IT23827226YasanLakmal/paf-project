package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;
    private ResourceDTO resourceDTO;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(1L);
        resource.setName("Main Lab");
        resource.setType("LAB");
        resource.setStatus("ACTIVE");

        resourceDTO = new ResourceDTO();
        resourceDTO.setName("Main Lab");
        resourceDTO.setType("LAB");
        resourceDTO.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should return all resources when no type is provided")
    void shouldReturnAllResources() {
        when(resourceRepository.findAll()).thenReturn(Collections.singletonList(resource));

        List<ResourceDTO> results = resourceService.getAllResources(null);

        assertEquals(1, results.size());
        assertEquals("Main Lab", results.get(0).getName());
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should create a resource successfully")
    void shouldCreateResourceSuccessfully() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceDTO result = resourceService.createResource(resourceDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Main Lab", result.getName());
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    @DisplayName("Should throw exception when resource not found by ID")
    void shouldThrowExceptionWhenResourceNotFound() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> resourceService.getResourceById(99L));
    }

    @Test
    @DisplayName("Should delete resource successfully")
    void shouldDeleteResource() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should update resource image successfully")
    void shouldUpdateResourceImage() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceDTO result = resourceService.updateResourceImage(1L, "/uploads/test.jpg");

        assertNotNull(result);
        assertEquals("/uploads/test.jpg", result.getImageUrl());
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }
}
