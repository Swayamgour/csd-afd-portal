import React, { useState } from 'react';
import { X, MessageSquare, Plus, Clock, User } from 'lucide-react';

export default function DepotNotesModal({ isOpen, onClose, demand, onAddNote }) {
  if (!isOpen || !demand) return null;

  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');

  const notesList = Array.isArray(demand.depotNotes) ? demand.depotNotes : [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setError('Please enter a note before adding.');
      return;
    }
    onAddNote(noteText.trim());
    setNoteText('');
    setError('');
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-notes-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <MessageSquare size={18} className="text-brand" />
            <h3 className="csd-modal-title">Depot Internal Notes · {demand.id}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          {/* Notes History */}
          <div className="depot-notes-history-list">
            {notesList.length === 0 ? (
              <p className="small muted text-center p-2">No notes recorded yet for this demand.</p>
            ) : (
              notesList.map((n, idx) => (
                <div key={idx} className="depot-note-card">
                  <div className="depot-note-header between">
                    <span className="row align-center gap-05 small font-semibold">
                      <User size={14} className="text-muted" /> {n.author || 'Depot Official'}
                    </span>
                    <span className="row align-center gap-05 micro muted">
                      <Clock size={12} /> {n.date}
                    </span>
                  </div>
                  <p className="depot-note-body">{n.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAdd} className="mt-2">
            <label className="form-label small font-semibold">Add Internal Note:</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Record offline inspection remarks, Treasury scroll confirmation, or ICDS entry ref..."
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <span className="text-danger small mt-05 block">{error}</span>}

            <div className="row justify-end mt-1">
              <button type="submit" className="btn-depot-manual-submit btn-sm">
                <Plus size={14} /> Add Note
              </button>
            </div>
          </form>
        </div>

        <div className="csd-modal-footer justify-end">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
