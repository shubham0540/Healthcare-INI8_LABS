package com.healthcare.patientportal.model;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class DocumentMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String filepath;

    @Column(nullable = false)
    private long filesize;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public DocumentMetadata() {
    }

    public DocumentMetadata(String filename, String filepath, long filesize, Instant createdAt) {
        this.filename = filename;
        this.filepath = filepath;
        this.filesize = filesize;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getFilepath() {
        return filepath;
    }

    public void setFilepath(String filepath) {
        this.filepath = filepath;
    }

    public long getFilesize() {
        return filesize;
    }

    public void setFilesize(long filesize) {
        this.filesize = filesize;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

