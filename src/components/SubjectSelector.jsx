export default function SubjectSelector({ subjects, onSelect }) {
  return (
    <div className="subject-selector">
      <div className="selector-hero">
        <h2>What do you want to do?</h2>
        <p>Pick a subject, then choose how to study.</p>
      </div>

      <div className="subject-grid">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className="subject-card"
            style={{ '--subject-color': subject.color }}
          >
            <div className="subject-card-header">
              <span className="subject-emoji">{subject.emoji}</span>
              <h3 className="subject-name">{subject.subject}</h3>
              <span className="subject-count">{subject.questions.length} questions</span>
            </div>
            <div className="subject-card-actions">
              <button
                className="btn btn-study"
                onClick={() => onSelect(subject, 'study')}
              >
                📖 Study
              </button>
              <button
                className="btn btn-quiz"
                onClick={() => onSelect(subject, 'quiz')}
              >
                🎯 Quiz me
              </button>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="empty-state">
          <p>No subjects yet. Click ⚙ Manage to add one!</p>
        </div>
      )}
    </div>
  )
}
