import React, { useState } from 'react';
import { X, MessageSquare, Plus, Clock, User } from 'lucide-react';
import { useGetDemandNotesQuery, useAddDemandNoteMutation } from '../../demand/demandApi.js';
import { getErrorMessage } from '../../../utils/apiError.js';

export default function DepotNotesModal({ isOpen, onClose, demand }) {
  const id = demand?._id || demand?.id;
  const { data: notes = [], isLoading } = useGetDemandNotesQuery(id, { skip: !isOpen || !id });
  const [addNote, { isLoading: saving }] = useAddDemandNoteMutation();
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !demand) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setError('Please enter a note before adding.');
      return;
    }
    try {
      await addNote({ id, text: noteText.trim() }).unwrap();
      setNoteText('');
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add note.'));
    }
  };

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-notes-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <MessageSquare size={18} className="text-brand" />
            <h3 className="csd-modal-title">Notes · {demand.demandNo || id}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          <div className="depot-notes-history-list">
            {isLoading ? (
              <p className="small muted text-center p-2">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="small muted text-center p-2">No notes recorded yet for this demand.</p>
            ) : (
              notes.map((n, idx) => (
                <div key={n._id || idx} className="depot-note-card">
                  <div className="depot-note-header between">
                    <span className="row align-center gap-05 small font-semibold">
                      <User size={14} className="text-muted" /> {String(n.role || 'Depot').replace(/_/g, ' ')}
                    </span>
                    <span className="row align-center gap-05 micro muted">
                      <Clock size={12} /> {n.at ? new Date(n.at).toLocaleString('en-IN') : ''}
                    </span>
                  </div>
                  <p className="depot-note-body">{n.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAdd} className="mt-2">
            <label className="form-label">Add Note:</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Record offline inspection remarks, bank scroll confirmation, or ICDS entry ref..."
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <span className="text-danger small mt-05 block">{error}</span>}
            <div className="row justify-end mt-1">
              <button type="submit" className="btn-depot-manual-submit btn-sm" disabled={saving}>
                <Plus size={14} /> {saving ? 'Adding...' : 'Add Note'}
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
