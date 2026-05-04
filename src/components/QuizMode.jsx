import { useState } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizMode({ subject, onBack }) {
  const [questions, setQuestions] = useState(() => shuffle(subject.questions))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([]) // { question, correct }
  const [done, setDone] = useState(false)

  const current = questions[index]
  const total = questions.length

  function reveal() {
    setRevealed(true)
  }

  function mark(correct) {
    const updated = [...results, { question: current, correct }]
    setResults(updated)
    setRevealed(false)
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function restart() {
    setQuestions(shuffle(subject.questions))
    setIndex(0)
    setRevealed(false)
    setResults([])
    setDone(false)
  }

  function retryWrong() {
    const wrong = results.filter(r => !r.correct).map(r => r.question)
    setQuestions(shuffle(wrong))
    setIndex(0)
    setRevealed(false)
    setResults([])
    setDone(false)
  }

  if (done) {
    const correct = results.filter(r => r.correct).length
    const pct = Math.round((correct / total) * 100)
    const wrong = results.filter(r => !r.correct)

    return (
      <div className="mode-container">
        <div className="results-card">
          <div className="results-emoji">
            {pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2>Quiz finished!</h2>
          <div className="results-score">
            <div className="score-block score-known">
              <span className="score-num">{correct}</span>
              <span className="score-label">Correct</span>
            </div>
            <div className="score-block score-missed">
              <span className="score-num">{total - correct}</span>
              <span className="score-label">Wrong</span>
            </div>
          </div>
          <p className="results-percent">{pct}% — {pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}</p>

          {wrong.length > 0 && (
            <div className="missed-list">
              <h3>Missed questions:</h3>
              {wrong.map((r, i) => (
                <div key={i} className="missed-item">
                  <span className="missed-q">Q: {r.question.q}</span>
                  <span className="missed-a">A: {r.question.a}</span>
                </div>
              ))}
            </div>
          )}

          <div className="results-actions">
            {wrong.length > 0 && (
              <button className="btn btn-primary" onClick={retryWrong}>
                Retry wrong ({wrong.length})
              </button>
            )}
            <button className="btn btn-secondary" onClick={restart}>
              Restart quiz
            </button>
            <button className="btn btn-ghost" onClick={onBack}>
              Back to subjects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mode-container">
      <div className="mode-header">
        <span className="subject-badge" style={{ background: subject.color }}>
          {subject.emoji} {subject.subject}
        </span>
        <span className="progress-label">
          {index + 1} / {total}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${(index / total) * 100}%`,
            background: subject.color,
          }}
        />
      </div>

      <div className="quiz-card">
        <span className="card-side-label">Question {index + 1}</span>
        <p className="card-text quiz-question">{current.q}</p>

        {!revealed ? (
          <button className="btn btn-primary reveal-btn" onClick={reveal}>
            Show Answer
          </button>
        ) : (
          <div className="quiz-answer-block">
            <span className="card-side-label answer-label">Answer</span>
            <p className="quiz-answer">{current.a}</p>
            <div className="quiz-parent-note">
              <em>👆 Mark how they did:</em>
            </div>
            <div className="card-actions">
              <button className="btn btn-missed" onClick={() => mark(false)}>
                ✗ Wrong
              </button>
              <button className="btn btn-known" onClick={() => mark(true)}>
                ✓ Correct
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="quiz-score-bar">
        {results.map((r, i) => (
          <span
            key={i}
            className={`score-dot ${r.correct ? 'dot-correct' : 'dot-wrong'}`}
            title={r.question.q}
          />
        ))}
      </div>
    </div>
  )
}
