import { useState, useCallback } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardMode({ subject, onBack }) {
  const [cards, setCards] = useState(() => shuffle(subject.questions))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState([])
  const [needsWork, setNeedsWork] = useState([])
  const [done, setDone] = useState(false)

  const current = cards[index]
  const total = cards.length

  function handleFlip() {
    setFlipped(f => !f)
  }

  const markKnown = useCallback(() => {
    setKnown(k => [...k, current])
    advance()
  }, [current, index, cards])

  const markNeedsWork = useCallback(() => {
    setNeedsWork(n => [...n, current])
    advance()
  }, [current, index, cards])

  function advance() {
    setFlipped(false)
    if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function restart() {
    setCards(shuffle(subject.questions))
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setNeedsWork([])
    setDone(false)
  }

  function reviewMissed() {
    setCards(shuffle(needsWork))
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setNeedsWork([])
    setDone(false)
  }

  if (done) {
    const pct = Math.round((known.length / total) * 100)
    return (
      <div className="mode-container">
        <div className="results-card">
          <div className="results-emoji">
            {pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2>Round complete!</h2>
          <div className="results-score">
            <div className="score-block score-known">
              <span className="score-num">{known.length}</span>
              <span className="score-label">Got it</span>
            </div>
            <div className="score-block score-missed">
              <span className="score-num">{needsWork.length}</span>
              <span className="score-label">Needs work</span>
            </div>
          </div>
          <p className="results-percent">{pct}% known</p>
          <div className="results-actions">
            {needsWork.length > 0 && (
              <button className="btn btn-primary" onClick={reviewMissed}>
                Review missed ({needsWork.length})
              </button>
            )}
            <button className="btn btn-secondary" onClick={restart}>
              Shuffle all again
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

      <div
        className={`flashcard ${flipped ? 'is-flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? handleFlip() : null}
        aria-label={flipped ? 'Answer shown, click to go back to question' : 'Click to reveal answer'}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <span className="card-side-label">Question</span>
            <p className="card-text">{current.q}</p>
            <span className="card-hint">tap to flip</span>
          </div>
          <div className="flashcard-back">
            <span className="card-side-label">Answer</span>
            <p className="card-text">{current.a}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="card-actions">
          <button className="btn btn-missed" onClick={markNeedsWork}>
            😬 Needs work
          </button>
          <button className="btn btn-known" onClick={markKnown}>
            ✅ Got it!
          </button>
        </div>
      )}

      {!flipped && (
        <div className="card-actions">
          <button className="btn btn-secondary" onClick={handleFlip}>
            Reveal answer
          </button>
        </div>
      )}
    </div>
  )
}
