package com.healthcare.patientportal.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.healthcare.patientportal.model.DocumentMetadata;
import com.healthcare.patientportal.service.DocumentService;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentMetadata> upload(@RequestParam("file") MultipartFile file) throws IOException {
        DocumentMetadata saved = documentService.save(file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public List<DocumentMetadata> list() {
        return documentService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id) {
        Resource resource = documentService.loadFile(id);
        DocumentMetadata metadata = documentService.getMetadata(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable("id") Long id) {
        documentService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Document deleted successfully");
        response.put("id", id.toString());
        return ResponseEntity.ok(response);
    }
}
