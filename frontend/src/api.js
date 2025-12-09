const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export function downloadDocument(id) {
  window.open(`${API_BASE}/documents/${id}`, '_blank');
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
}

async function safeError(res) {
  try {
    const data = await res.json();
    return data.error || data.message || 'Request failed';
  } catch {
    return res.statusText || 'Request failed';
  }
}

