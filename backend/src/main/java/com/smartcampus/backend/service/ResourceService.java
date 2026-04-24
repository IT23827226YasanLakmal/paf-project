package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<ResourceDTO> getAllResources(String type) {
        List<Resource> resources = (type != null) ? resourceRepository.findByType(type) : resourceRepository.findAll();
        return resources.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return mapToDTO(resource);
    }

    public ResourceDTO createResource(ResourceDTO dto) {
        Resource resource = mapToEntity(dto);
        resource = resourceRepository.save(resource);
        return mapToDTO(resource);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        resource.setStatus(dto.getStatus());
        resource.setImageUrl(dto.getImageUrl());

        resource = resourceRepository.save(resource);
        return mapToDTO(resource);
    }

    public ResourceDTO updateResourceImage(Long id, String imageUrl) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setImageUrl(imageUrl);
        resource = resourceRepository.save(resource);
        return mapToDTO(resource);
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    private ResourceDTO mapToDTO(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setStatus(resource.getStatus());
        dto.setImageUrl(resource.getImageUrl());
        return dto;
    }

    private Resource mapToEntity(ResourceDTO dto) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        resource.setStatus(dto.getStatus());
        resource.setImageUrl(dto.getImageUrl());
        return resource;
    }
}
