import { useState, useEffect } from 'react'
import SubjectSelector from './components/SubjectSelector'
import FlashcardMode from './components/FlashcardMode'
import QuizMode from './components/QuizMode'
import ManageSubjects from './components/ManageSubjects'
import { builtinSubjects } from './data/builtinSubjects'

const STORAGE_KEY = 'homework-tool-subjects'

function loadSubjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const custom = JSON.parse(saved)
      const customIds = new Set(custom.map(s => s.id))
      const builtins = builtinSubjects.filter(s => !customIds.has(s.id))
      return [...builtins, ...custom]
    }
  } catch {}
  return builtinSubjects
}

function saveCustomSubjects(subjects) {
  const custom = subjects.filter(s => !builtinSubjects.find(b => b.id === s.id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
}

export default function App() {
  const [subjects, setSubjects] = useState(loadSubjects)
  const [screen, setScreen] = useState('home') // 'home' | 'study' | 'quiz' | 'manage'
  const [selectedSubject, setSelectedSubject] = useState(null)

  useEffect(() => {
    saveCustomSubjects(subjects)
  }, [subjects])

  function handleSelectSubject(subject, mode) {
    setSelectedSubject(subject)
    setScreen(mode)
  }

  function handleBack() {
    setScreen('home')
    setSelectedSubject(null)
  }

  function handleSaveSubjects(updated) {
    setSubjects(updated)
  }

  function handleEditSubject(subject) {
    setSelectedSubject(subject)
    setScreen('manage')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <span className="app-logo">📚</span>
          <h1 className="app-title">Study Tool</h1>
          <nav className="header-nav">
            {screen !== 'home' && (
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back
              </button>
            )}
            {screen === 'home' && (
              <button
                className="btn btn-ghost"
                onClick={() => { setSelectedSubject(null); setScreen('manage') }}
                title="Manage subjects"
              >
                ⚙ Manage
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {screen === 'home' && (
          <SubjectSelector subjects={subjects} onSelect={handleSelectSubject} onEdit={handleEditSubject} />
        )}
        {screen === 'study' && selectedSubject && (
          <FlashcardMode subject={selectedSubject} onBack={handleBack} />
        )}
        {screen === 'quiz' && selectedSubject && (
          <QuizMode subject={selectedSubject} onBack={handleBack} />
        )}
        {screen === 'manage' && (
          <ManageSubjects
            subjects={subjects}
            builtinIds={builtinSubjects.map(s => s.id)}
            onSave={handleSaveSubjects}
            onBack={() => { setSelectedSubject(null); setScreen('home') }}
            initialEdit={selectedSubject}
          />
        )}
      </main>
    </div>
  )
}
