import { useEffect, useState } from 'react';
import { uploadDocument, fetchDocuments, downloadDocument, deleteDocument } from './api';

function App() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info'); // info | error | success
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDocuments = async () => {
    setRefreshing(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setStatus(err.message);
      setStatusType('error');
    }
    setRefreshing(false);
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
      <div className="header">
        <div>
          <p className="eyebrow">Healthcare Portal</p>
          <h1>Patient Documents</h1>
          <p className="subhead">Upload, manage, and download your medical PDFs securely.</p>
        </div>
        <div className="top-banner">
          <span className="pill">Secure PDF Storage</span>
          <span className="pill">Fast Uploads</span>
          <span className="pill">Download & Delete</span>
        </div>
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
        <div className="list-header">
          <h2>Uploaded Documents</h2>
          <div className="list-actions">
            {refreshing && <span className="mini-badge">Refreshing...</span>}
            <button
              type="button"
              className="ghost"
              onClick={loadDocuments}
              disabled={refreshing || loading}
            >
              Refresh
            </button>
          </div>
        </div>
        {documents.length === 0 && (
          <div className="empty">
            <p>No documents yet.</p>
            <p className="muted">Upload your first PDF to see it here.</p>
          </div>
        )}
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} className="doc-row">
              <div>
                <strong>{doc.filename}</strong>
                <div className="chip-row">
                  <span className="chip">{formatSize(doc.filesize)}</span>
                  <span className="chip chip-secondary">{formatDate(doc.createdAt)}</span>
                </div>
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

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}

