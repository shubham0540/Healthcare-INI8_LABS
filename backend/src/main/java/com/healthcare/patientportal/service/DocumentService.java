package com.healthcare.patientportal.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.healthcare.patientportal.exception.DuplicateFileException;
import com.healthcare.patientportal.exception.ResourceNotFoundException;
import com.healthcare.patientportal.model.DocumentMetadata;
import com.healthcare.patientportal.repository.DocumentRepository;

import jakarta.annotation.PostConstruct;

@Service
public class DocumentService {

    private final DocumentRepository repository;
    private final Path uploadDir;

    public DocumentService(DocumentRepository repository,
            @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.repository = repository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(uploadDir);
    }

    public DocumentMetadata save(MultipartFile file) throws IOException {
        validatePdf(file);
        String originalName = StringUtils.cleanPath(file.getOriginalFilename());

        // Check if file with same filename already exists
        if (repository.findByFilename(originalName).isPresent()) {
            throw new DuplicateFileException("PDF already exists");
        }

        String storedName = UUID.randomUUID() + "-" + originalName.replaceAll("\\s+", "_");
        Path target = uploadDir.resolve(storedName);
        Files.copy(file.getInputStream(), target);

        DocumentMetadata metadata = new DocumentMetadata(originalName, target.toString(), file.getSize(), Instant.now());
        return repository.save(metadata);
    }

    public List<DocumentMetadata> listAll() {
        return repository.findAll();
    }

    public Resource loadFile(Long id) {
        DocumentMetadata metadata = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        Path path = Paths.get(metadata.getFilepath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("File missing on disk");
        }
        return new FileSystemResource(path);
    }

    public DocumentMetadata getMetadata(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    public void delete(Long id) {
        DocumentMetadata metadata = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        Path path = Paths.get(metadata.getFilepath());
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
        repository.deleteById(id);
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        String name = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean isPdf = (name != null && name.toLowerCase().endsWith(".pdf"))
                || "application/pdf".equalsIgnoreCase(contentType);
        if (!isPdf) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }
}
