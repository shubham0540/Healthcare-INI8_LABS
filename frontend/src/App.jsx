import { useEffect, useState } from 'react';
import { uploadDocument, fetchDocuments, downloadDocument, deleteDocument } from './api';

function App() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info'); // info | error | success
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const [loading, setLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusType('error');
      setStatus('Please choose a PDF file');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatusType('error');
      setStatus('Only PDF files are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setStatusType('error');
      setStatus('File is greater than 10 MB');
      return;
    }
    setLoading(true);
    setStatus('');
    setStatusType('info');
    try {
      await uploadDocument(file);
      setStatusType('success');
      setStatus('Upload successful');
      setFile(null);
      e.target.reset();
      await loadDocuments();
    } catch (err) {
      setStatusType('error');
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setStatus('');
    setStatusType('info');
    try {
      await deleteDocument(id);
      setStatusType('success');
      setStatus('Document deleted');
      await loadDocuments();
    } catch (err) {
      setStatusType('error');
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Patient Portal - Documents</h1>
      <div className="top-banner">
        <span className="pill">Secure PDF Storage</span>
        <span className="pill">Fast Uploads</span>
      </div>
      <form onSubmit={onSubmit} className="card">
        <label htmlFor="file">Upload PDF</label>
        <input
          id="file"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={loading}>Upload</button>
      </form>

      {status && <div className={`status ${statusType}`}>{status}</div>}

      <div className="card">
        <h2>Uploaded Documents</h2>
        {documents.length === 0 && <p>No documents yet.</p>}
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} className="doc-row">
              <div>
                <strong>{doc.filename}</strong>
                <span className="meta">
                  {(doc.filesize / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="actions">
                <button onClick={() => downloadDocument(doc.id)}>Download</button>
                <button className="danger" onClick={() => handleDelete(doc.id)} disabled={loading}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

