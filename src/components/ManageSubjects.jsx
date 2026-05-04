import { useState } from 'react'

const COLORS = ['#4f86f7', '#2ecc71', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12', '#3498db']
const EMOJIS = ['📚', '🔢', '🔬', '📜', '📖', '🌍', '🎨', '🎵', '⚽', '🏛️', '💻', '🧮']

function blankSubject() {
  return {
    id: `custom-${Date.now()}`,
    subject: '',
    emoji: '📚',
    color: COLORS[0],
    questions: [],
  }
}

export default function ManageSubjects({ subjects, builtinIds, onSave, onBack }) {
  const [view, setView] = useState('list') // 'list' | 'edit' | 'import'
  const [editing, setEditing] = useState(null)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [newQ, setNewQ] = useState({ q: '', a: '' })

  function startNew() {
    setEditing(blankSubject())
    setView('edit')
  }

  function startEdit(subject) {
    setEditing({ ...subject, questions: [...subject.questions] })
    setView('edit')
  }

  function deleteSubject(id) {
    if (!confirm('Delete this subject and all its questions?')) return
    onSave(subjects.filter(s => s.id !== id))
  }

  function saveEditing() {
    if (!editing.subject.trim()) return alert('Please enter a subject name.')
    if (editing.questions.length === 0) return alert('Add at least one question.')
    const exists = subjects.find(s => s.id === editing.id)
    if (exists) {
      onSave(subjects.map(s => s.id === editing.id ? editing : s))
    } else {
      onSave([...subjects, editing])
    }
    setView('list')
    setEditing(null)
  }

  function addQuestion() {
    if (!newQ.q.trim() || !newQ.a.trim()) return
    setEditing(e => ({ ...e, questions: [...e.questions, { q: newQ.q.trim(), a: newQ.a.trim() }] }))
    setNewQ({ q: '', a: '' })
  }

  function removeQuestion(i) {
    setEditing(e => ({ ...e, questions: e.questions.filter((_, idx) => idx !== i) }))
  }

  function handleImport() {
    setImportError('')
    try {
      const data = JSON.parse(importText)
      const arr = Array.isArray(data) ? data : [data]
      for (const s of arr) {
        if (!s.subject || !Array.isArray(s.questions)) throw new Error('Each subject needs "subject" and "questions" fields.')
        for (const q of s.questions) {
          if (!q.q || !q.a) throw new Error('Each question needs "q" and "a" fields.')
        }
      }
      const merged = [...subjects]
      for (const s of arr) {
        const id = s.id || `custom-${s.subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        const idx = merged.findIndex(x => x.id === id)
        const built = { emoji: '📚', color: COLORS[0], ...s, id }
        if (idx >= 0) merged[idx] = built
        else merged.push(built)
      }
      onSave(merged)
      setImportText('')
      setView('list')
    } catch (e) {
      setImportError(e.message)
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setImportText(ev.target.result)
    reader.readAsText(file)
  }

  if (view === 'import') {
    return (
      <div className="mode-container">
        <h2>Import from JSON</h2>
        <p className="help-text">
          Upload a <code>.json</code> file or paste JSON below. Format:
        </p>
        <pre className="code-example">{`{
  "subject": "Geography",
  "emoji": "🌍",
  "color": "#3498db",
  "questions": [
    { "q": "Capital of France?", "a": "Paris" },
    { "q": "Longest river in the world?", "a": "The Nile" }
  ]
}`}</pre>

        <label className="file-upload-label">
          <input type="file" accept=".json" onChange={handleFileUpload} className="file-input" />
          📂 Choose JSON file
        </label>

        <textarea
          className="import-textarea"
          placeholder="…or paste JSON here"
          value={importText}
          onChange={e => setImportText(e.target.value)}
          rows={10}
        />
        {importError && <p className="error-msg">⚠ {importError}</p>}
        <div className="action-row">
          <button className="btn btn-ghost" onClick={() => setView('list')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={!importText.trim()}>
            Import
          </button>
        </div>
      </div>
    )
  }

  if (view === 'edit' && editing) {
    return (
      <div className="mode-container">
        <h2>{editing.questions.length === 0 && !subjects.find(s => s.id === editing.id) ? 'New Subject' : 'Edit Subject'}</h2>

        <div className="edit-field">
          <label>Subject name</label>
          <input
            className="text-input"
            value={editing.subject}
            onChange={e => setEditing(ed => ({ ...ed, subject: e.target.value }))}
            placeholder="e.g. Geography"
          />
        </div>

        <div className="edit-field">
          <label>Emoji icon</label>
          <div className="emoji-picker">
            {EMOJIS.map(em => (
              <button
                key={em}
                className={`emoji-btn ${editing.emoji === em ? 'selected' : ''}`}
                onClick={() => setEditing(ed => ({ ...ed, emoji: em }))}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="edit-field">
          <label>Colour</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-btn ${editing.color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setEditing(ed => ({ ...ed, color: c }))}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="edit-field">
          <label>Questions ({editing.questions.length})</label>
          <div className="question-list">
            {editing.questions.map((q, i) => (
              <div key={i} className="question-item">
                <div className="question-item-text">
                  <span className="q-label">Q:</span> {q.q}<br />
                  <span className="q-label">A:</span> {q.a}
                </div>
                <button className="btn-icon" onClick={() => removeQuestion(i)} title="Remove">✕</button>
              </div>
            ))}
          </div>

          <div className="add-question-form">
            <input
              className="text-input"
              placeholder="Question"
              value={newQ.q}
              onChange={e => setNewQ(n => ({ ...n, q: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('answer-input').focus()}
            />
            <input
              id="answer-input"
              className="text-input"
              placeholder="Answer"
              value={newQ.a}
              onChange={e => setNewQ(n => ({ ...n, a: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addQuestion()}
            />
            <button className="btn btn-secondary" onClick={addQuestion}>+ Add</button>
          </div>
        </div>

        <div className="action-row">
          <button className="btn btn-ghost" onClick={() => { setView('list'); setEditing(null) }}>Cancel</button>
          <button className="btn btn-primary" onClick={saveEditing}>Save subject</button>
        </div>
      </div>
    )
  }

  // list view
  return (
    <div className="mode-container">
      <div className="manage-header">
        <h2>Manage Subjects</h2>
        <div className="manage-actions">
          <button className="btn btn-secondary" onClick={() => setView('import')}>
            📂 Import JSON
          </button>
          <button className="btn btn-primary" onClick={startNew}>
            + New subject
          </button>
        </div>
      </div>

      <div className="manage-list">
        {subjects.map(s => (
          <div key={s.id} className="manage-item">
            <span className="manage-emoji">{s.emoji}</span>
            <div className="manage-info">
              <strong>{s.subject}</strong>
              <span>{s.questions.length} questions</span>
            </div>
            <div className="manage-item-actions">
              <button className="btn btn-ghost" onClick={() => startEdit(s)}>Edit</button>
              {!builtinIds.includes(s.id) && (
                <button className="btn btn-danger" onClick={() => deleteSubject(s.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: '1.5rem' }}>
        ← Back to home
      </button>
    </div>
  )
}
