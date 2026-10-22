import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { getCookie } from '../../utils/cookie.js';

export default function DocumentPreviewModal({ isOpen, onClose, doc }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !doc?.url) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const fetchFile = async () => {
      try {
        const token =
          localStorage.getItem('csd_auth_token') ||
          getCookie('csd_auth_token') ||
          getCookie('accessToken');
        const backendBase =
          import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ||
          'http://localhost:5000';
        const fullUrl = doc.url.startsWith('http')
          ? doc.url
          : `${backendBase}${doc.url.startsWith('/') ? '' : '/'}${doc.url}`;

        const res = await fetch(fullUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          throw new Error(`Failed to load document (${res.status} ${res.statusText})`);
        }

        const blob = await res.blob();
        if (active) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to display document');
          setLoading(false);
        }
      }
    };

    fetchFile();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const isImage =
    /\.(png|jpe?g|webp|gif|svg)$/i.test(doc.name || '') ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(doc.url || '');

  return (
    <div
      className="csd-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="csd-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95%',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #334155'
        }}
      >
        {/* Modal Header */}
        <div
          className="between align-center p-3"
          style={{
            background: 'linear-gradient(135deg, #0b2a6b 0%, #1e4fd8 100%)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={18} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {doc.label || doc.type || 'Verification Document'} · {doc.name || 'Document'}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#bfdbfe', letterSpacing: '0.02em' }}>
                Official CSD AFD Verification Portal · In-App Document Viewer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0, marginLeft: '1rem' }}>
            {blobUrl && (
              <a
                href={blobUrl}
                download={doc.name || 'CSD-Document.pdf'}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <Download size={13} /> Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              aria-label="Close document viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
              <Loader2 size={38} className="animate-spin text-brand mx-auto mb-2" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: '0 0 0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Loading document securely within portal...
              </p>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Authenticating with CSD document vault
              </span>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff', maxWidth: '440px' }}>
              <AlertCircle size={42} style={{ color: '#ef4444', margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#f87171', fontSize: '1rem' }}>
                Unable to Load Document
              </h4>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {error}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onClose}
                style={{
                  background: '#1e4fd8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Viewer
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            isImage ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
                }}
              >
                <img
                  src={blobUrl}
                  alt={doc.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </div>
            ) : (
              <iframe
                src={`${blobUrl}#toolbar=1`}
                title={doc.name || 'Document'}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
