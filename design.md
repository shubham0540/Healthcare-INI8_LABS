
## Part 1: Design Document (Mandatory)

### 1) Tech Stack Choices
**Q1. What frontend framework did you use and why?**
**Ans**-I chose **React**  as the frontend framework for the following reasons:
  1. **Component-Based Architecture**: React's component model makes it easy to build reusable UI pieces. For this project, I created components for the upload form, document list, and status messages, keeping the code organized and maintainable.
  2. **Fast Development Experience**: 
   - Optimized production builds
   - Minimal configuration needed to get started
  3. **Rich Ecosystem**: React has extensive community support, libraries, and resources. 
  4. **Industry Standard**: React is widely used in production applications.

**Q2. What backend framework did you choose and why?**
**Ans**-I chose **Spring Boot** as the backend framework for the following reasons:
  1. **Rapid Development**: Minimal setup with convention-over-configuration. Annotations (`@RestController`, `@Service`, `@Repository`) create a functional REST API quickly. Embedded Tomcat server starts automatically.
  2. **Robust File Handling**: Excellent multipart file upload support via `MultipartFile` interface with built-in size limits, validation, and efficient stream-based operations.
  3. **Database Integration**: Spring Data JPA simplifies operations with automatic repository implementation, built-in CRUD, transaction management, and database-agnostic approach.
  4. **Exception Handling**: Centralized error handling with `@ControllerAdvice` for consistent API responses.
  5. **CORS Support**: Built-in CORS configuration for frontend integration.
  6. **Enterprise-Ready**: Production-tested, widely used in enterprise applications with strong type safety and tooling.

**Q3. What database did you choose and why?**
**Ans**-I chose **MySQL** as the database for the following reasons:
  1. **Familiar and Widely Used**: Popular relational database with excellent documentation and large community support.
  2. **Excellent GUI Tool**: MySQL Workbench provides user-friendly interface, run queries, manage tables and debug issues easily.
  3. **Spring Boot Integration**: Seamless integration with Spring Data JPA. The `ddl-auto=update` property automatically creates/updates schema based on entity classes.
  4. **Relational Structure**: Perfect for storing structured metadata (id, filename, filepath, filesize, created_at) with proper relationships and constraints.


**Q4. If you were to support 1,000 users, what changes would you consider?**
**Ans**-To support 1,000 users, I would consider the following changes:
  1. **Authentication & Authorization**: Implement JWT-based authentication and role-based access control.
  2. **Database Optimization**: Add indexes on `documents` table (created_at, filename, user_id), implement read replicas, and add pagination for document listings.
  3. **File Storage**: Move from local filesystem to cloud object storage (AWS S3, MinIO), use signed URLs for secure downloads.
  4. **Backend Scaling**: Horizontal scaling with load balancer, implement caching .
  5. **Frontend Optimization**: Implement lazy loading, pagination, search functionality, and optimize bundle size with code splitting.


### 2) Architecture Overview

**System Architecture Flow:**
 
  ```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 5173    │
└────────┬────────┘
         │ HTTP REST API Calls
         │ (GET, POST, DELETE)
         ▼
┌─────────────────┐
│   Backend       │
│   (Spring Boot) │
│   Port: 8080    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   MySQL         │  │   File Storage  │
│   Database      │  │   (uploads/)    │
│   Port: 3306    │  │   Local Disk    │
│                 │  │                 │
│   Table:        │  │   Stores PDF   │
│   documents     │  │   files with    │
│   (metadata)    │  │   unique names  │
└─────────────────┘  └─────────────────┘
```

**Component Description:**

  1. **Frontend (React + Vite)**: Runs on `http://localhost:5173`. Provides UI for upload/view/download/delete operations. Makes HTTP requests to backend API. Handles client-side validation and displays success/error messages.

  2. **Backend (Spring Boot)**: Runs on `http://localhost:8080`. Exposes REST API endpoints (`/documents/upload`, `/documents`, `/documents/{id}`). Validates PDF files, manages file operations on local filesystem, interacts with MySQL for metadata storage and exception handling.

  3. **Database (MySQL)**: Runs on `localhost:3306`. Stores document metadata in `documents` table. Managed via Spring Data JPA with automatic schema updates.

  4. **File Storage (Local Filesystem)**: Stores PDF files in `backend/uploads/` directory with unique names. Original filename preserved in database. Files deleted when document is removed via API.

**Data Flow Summary:**
  - **Upload**: Frontend → Backend (validates) → Saves file to `uploads/` → Stores metadata in MySQL → Returns response to Frontend
  - **List**: Frontend → Backend → Queries MySQL → Returns metadata array to Frontend
  - **Download**: Frontend → Backend → Queries MySQL for filepath → Reads file from `uploads/` → Streams to Frontend
  - **Delete**: Frontend → Backend → Deletes from MySQL → Deletes file from `uploads/` → Returns success to Frontend


### 3) API Specification
**Base URL:** `http://localhost:8080`

 #### 1. Upload a PDF
  - **URL:** `POST /documents/upload`
  - **Description:** Uploads a PDF file (max 10 MB). Validates file type and saves to local storage with metadata in database.
  - **Request:** `curl -X POST http://localhost:8080/documents/upload -F "file=@document.pdf"`
  - **Response (200):** `{ "id": 1, "filename": "prescription.pdf", "filepath": "...", "filesize": 245678, "createdAt": "2024-12-09T14:30:00Z" }`

#### 2. List all documents
  - **URL:** `GET /documents`
  - **Description:** Retrieves list of all uploaded documents with metadata.
  - **Request:** `curl http://localhost:8080/documents`
  - **Response (200):** `[{ "id": 1, "filename": "...", "filepath": "...", "filesize": 245678, "createdAt": "..." }, ...]`

#### 3. Download a file
  - **URL:** `GET /documents/{id}`
  - **Description:** Downloads PDF file by ID as binary stream.
  - **Request:** `curl -OJ http://localhost:8080/documents/1`
  - **Response (200):** PDF file with headers `Content-Type: application/pdf`, `Content-Disposition: attachment`
  - **Errors:** 404 (not found)

#### 4. Delete a file
  - **URL:** `DELETE /documents/{id}`
  - **Description:** Deletes document by ID (removes file and metadata).
  - **Request:** `curl -X DELETE http://localhost:8080/documents/1`
  - **Response (204):** Empty response body
  - **Errors:** 404 (not found)


### 4) Data Flow Description
**Q5. Describe the step-by-step process of what happens when a file is uploaded and when it is downloaded.**
**Ans**-step-by-step process:
 #### File Upload Process:
  1. **User selects PDF** → Frontend validates file type (`.pdf`) and size (≤ 10 MB). Shows error if validation fails.
  2. **Frontend sends POST request** → Creates `FormData` with file and sends to `POST /documents/upload` with `multipart/form-data`.
  3. **Backend receives and validates** → Spring Boot controller extracts `MultipartFile`, validates content type, extension, and size. Returns 400 if invalid.
  4. **File saved to disk** → Backend creates `uploads/` directory if needed, generates unique UUID-based filename, saves PDF to `backend/uploads/`.
  5. **Metadata stored in MySQL** → Creates `DocumentMetadata` with filename, filepath, filesize, created_at. Saves to `documents` table via JPA. Database auto-generates `id`.
  6. **Response sent** → Backend returns HTTP 200 with JSON metadata (`id`, `filename`, `filepath`, `filesize`, `createdAt`).
  7. **Frontend updates UI** → Adds document to list, displays success message, refreshes document list.

#### File Download Process:
  1. **User clicks download** → Frontend extracts document `id` and sends GET request to `/documents/{id}`.
  2. **Backend queries database** → Searches MySQL `documents` table for metadata by `id`. Returns 404 if not found.
  3. **File retrieved from disk** → Backend reads file from filesystem using stored `filepath`. Returns 404 if file missing.
  4. **File streamed to client** → Backend sets headers (`Content-Type: application/pdf`, `Content-Disposition: attachment`) and streams PDF binary data.
  5. **Browser downloads file** → Browser receives stream, triggers download with original filename, saves to user's download folder.



### 5) Assumptions:-
**Q6. What assumptions did you make while building this? (e.g., file size limits, authentication, concurrency)**
**Ans**-The following assumptions were made during development:
  1. **Single User, No Authentication**: No login/authentication system. All documents accessible to anyone. Would need auth for production.
  2. **File Type and Size Limits**: Only the PDF files accepted with  Maximum size 10 MB.
  3. **Database Configuration**: MySQL running locally on port 3306. Connection: `jdbc:mysql://localhost:3306/healthcare`. Database auto-created, schema auto-updates via JPA.
  4. **File Storage**: Local filesystem in `backend/uploads/` directory. Files stored on same server, not shared storage. Not suitable for horizontal scaling.
  6. **Concurrency**: No explicit handling for concurrent operations. Relies on Spring Boot's default request handling and JPA transactions.
  7. **Error Handling**: Basic error handling with HTTP status codes and JSON error messages. No retry mechanisms.
  8. **Network and Infrastructure**: Runs on localhost (backend: 8080, frontend: 5173), Suitable only for local development.



Part 2: Local Implementation:-
### 1. Frontend
#### Upload PDF file 
  - **File Type Validation**: Checks extension (`.pdf`) and MIME type (`application/pdf`). Shows error "Only PDF files are allowed" if invalid.
  - **File Size Validation**: Maximum 10 MB. Shows error "File is greater than 10 MB" in red if exceeded.
  - **Duplicate Check**: Backend validates duplicate filenames. Shows error "PDF already exists" if duplicate.
  - **Upload Process**: Creates `FormData`, sends POST to `/documents/upload`, shows loading state, displays success message, auto-refreshes list.

#### Show uploaded files in a list
  - **Document List**: Fetches documents on mount via `useEffect`. Displays filename (bold), file size (KB), upload date. Shows "No documents yet." when empty.
  - **Auto-refresh**: List refreshes automatically after upload/delete operations.

#### Allow download and deletion
  - **Download**: "Download" button sends GET to `/documents/{id}`, opens file in new tab for download with original filename.
  - **Delete**: "Delete" button (red) sends DELETE to `/documents/{id}`, shows loading, displays success message, refreshes list.
  - **Status Messages**: Success (green), Error (red), Info (blue). Displayed above document list.
  - **Error Handling**: Catches and displays backend error messages, handles network errors gracefully.


### 2. Backend:-
#### Store files locally in uploads/
  - **Upload Directory**: Configured via `app.upload-dir=uploads` in `application.properties`. Auto-creates directory on startup if missing.
  - **File Storage**: Files saved with unique UUID-based names to prevent conflicts. Original filename preserved in database. Uses Java NIO `Files` API for operations.

#### Store metadata in a database
  - **Database**: MySQL `healthcare` database with `documents` table. `DocumentMetadata` JPA entity with fields: `id` (PK, auto-increment), `filename`, `filepath`, `filesize`, `created_at`.
  - **Repository**: Spring Data JPA `DocumentRepository` for CRUD operations. Schema auto-updates via `ddl-auto=update`. `findByFilename()` checks for duplicates.

#### Handle all required endpoints
  - **POST `/documents/upload`**: Accepts `multipart/form-data`, validates PDF (type, size ≤ 10 MB), checks duplicates, saves to `uploads/`, stores metadata in MySQL. Returns 200 with metadata or 400/409/500 errors.
  - **GET `/documents`**: Returns all `DocumentMetadata` objects as JSON array. Queries MySQL via `repository.findAll()`. Returns empty array if none.
  - **GET `/documents/{id}`**: Downloads PDF by ID. Queries database, reads from filesystem, returns binary stream with `Content-Type: application/pdf` and `Content-Disposition: attachment`. Returns 404 if not found.
  - **DELETE `/documents/{id}`**: Deletes document by ID. Removes file from filesystem and metadata from MySQL. Returns 204 on success, 404 if not found.
  - **Error Handling**: Centralized via `@ControllerAdvice`. Handles `ResourceNotFoundException` (404), `DuplicateFileException` (409), `IllegalArgumentException` (400), `MaxUploadSizeExceededException` (400), generic (500).
  - **CORS**: Enabled for `http://localhost:5173` and `http://localhost:3000`.

