### Healthcare Patient Portal (Upload PDFs)

Local full-stack demo where a single user uploads, lists, downloads, and deletes medical PDF documents. Frontend: React + Vite. Backend: Spring Boot (Java 17) with MySQL for metadata and local `uploads/` storage for files.

#### Prerequisites
- Java 17+, Maven
- Node 18+, npm
- MySQL running locally (e.g., via MySQL Workbench) with credentials: user `#yourUsername`, password `yourpassword`. DB `healthcare` will be created automatically.

#### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
- Configuration: `backend/src/main/resources/application.properties` (change MySQL URL/credentials or `app.upload-dir`).
- Uploads are stored on disk under `uploads/` (created automatically).

#### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Opens at the shown localhost port (default `http://localhost:5173`).
- Set `VITE_API_BASE` env var to point to the backend if you change the API host.

#### API (base `http://localhost:8080`)
- `POST /documents/upload` – multipart `file` (PDF). Returns metadata.
- `GET /documents` – list metadata.
- `GET /documents/{id}` – download file.
- `DELETE /documents/{id}` – remove metadata and local file.

Example curl calls:

**Upload a PDF:**
```bash
curl -F "file=@sample.pdf" http://localhost:8080/documents/upload
```
Response: `{"id":1,"filename":"sample.pdf","filepath":"...","filesize":1234,"createdAt":"2024-12-09T..."}`

**List all documents:**
```bash
curl http://localhost:8080/documents
```
Response: `[{"id":1,"filename":"sample.pdf",...}]`

**Download a file:**
```bash
curl -OJ http://localhost:8080/documents/1
```
Response: Downloads PDF file with original filename

**Delete a document:**
```bash
curl -X DELETE http://localhost:8080/documents/1
```
Response: `{"message":"Document deleted successfully","id":"1"}`

See `design.md` for architecture, stack choices, API details, and assumptions.

