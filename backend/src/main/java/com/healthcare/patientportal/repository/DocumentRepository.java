package com.healthcare.patientportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.patientportal.model.DocumentMetadata;

public interface DocumentRepository extends JpaRepository<DocumentMetadata, Long> {

    Optional<DocumentMetadata> findByFilename(String filename);
}
