import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  MONTHS,
  DAYS_SHORT,
  MONTH_IMAGES,
  MONTH_ACCENTS,
  buildCalendarGrid,
  RANGE_COLORS,
} from './calendarData'
import './WallCalendar.css'

const SPIRAL_COUNT = 24
const NOTE_LINES = 7

function ThemeIcon({ theme }) {
  if (theme === 'light') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M14.5 3.5A8.5 8.5 0 1 0 20.5 17a7 7 0 1 1-6-13.5Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 1.8v2.6M12 19.6v2.6M4.4 4.4 6.2 6.2M17.8 17.8l1.8 1.8M1.8 12h2.6M19.6 12h2.6M4.4 19.6l1.8-1.8M17.8 6.2l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function WallCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [notes, setNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wc_notes') || '{}')
      return saved
    } catch {
      return {}
    }
  })
  const [ranges, setRanges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wc_ranges') || '[]')
    } catch { return [] }
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('wc_theme') || 'light'
  })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const weeks = useMemo(() => buildCalendarGrid(year, month), [year, month])
  const accent = MONTH_ACCENTS[month]
  useEffect(() => {
    try {
      localStorage.setItem('wc_notes', JSON.stringify(notes))
      localStorage.setItem('wc_ranges', JSON.stringify(ranges))
      localStorage.setItem('wc_theme', theme)
    } catch { /* ignore */ }
  }, [notes, ranges, theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const goMonth = useCallback((delta) => {
    if (transitioning) return
    setTransitioning(true)
    setImageLoaded(false)
    setTimeout(() => {
      let m = month + delta
      let y = year
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      setMonth(m)
      setYear(y)
      setTimeout(() => setTransitioning(false), 60)
    }, 180)
  }, [month, year, transitioning])

  const handleDayClick = useCallback((day) => {
    if (!day) return

    setRanges(prev => {
      const lastRange = prev[prev.length - 1]

      if (lastRange && lastRange.start && !lastRange.end) {
        const updated = [...prev]
        const range = { ...lastRange }
        if (day < range.start) {
          range.end = range.start
          range.start = day
        } else {
          range.end = day
        }
        updated[updated.length - 1] = range
        return updated
      }

      return [
        ...prev,
        {
          id: Date.now(),
          start: day,
          end: null,
          label: '',
          colorIdx: prev.length % RANGE_COLORS.length,
          year,
          month
        }
      ]
    })
  }, [year, month])

  const deleteRange = (id) => {
    setRanges(prev => prev.filter(r => r.id !== id))
  }

  const updateRange = (id, fields) => {
    setRanges(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r))
  }

  const noteKey = `${year}-${month}`
  const currentNotes = notes[noteKey] || Array(NOTE_LINES).fill('')

  const updateNote = (index, value) => {
    const updated = [...currentNotes]
    updated[index] = value
    setNotes((prev) => ({ ...prev, [noteKey]: updated }))
  }

  const isToday = (day, inCurrentMonth) =>
    inCurrentMonth &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()

  const getRangeInfo = (day) => {
    if (!day) return null
    for (let i = ranges.length - 1; i >= 0; i--) {
      const r = ranges[i]
      if (r.year !== year || r.month !== month) continue

      if (r.end === null) {
        if (day === r.start) return { ...r, type: 'start end animate' }
      } else {
        if (day === r.start) return { ...r, type: 'start' }
        if (day === r.end) return { ...r, type: 'end' }
        if (day > r.start && day < r.end) return { ...r, type: 'mid' }
      }
    }
    return null
  }

  const isWeekend = (colIndex) => colIndex >= 5
  const currentRanges = ranges.filter(r => r.year === year && r.month === month)

  return (
    <div className="calendar-wrapper" data-theme={theme}>
      <div className="wall-hook" />

      <div className="spiral-row">
        {Array.from({ length: SPIRAL_COUNT }, (_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      <div className="calendar-body" style={{ '--month-accent': accent }}>
        <div className={`hero-section ${transitioning ? 'transitioning' : ''}`}>
          <img
            className={`hero-image ${imageLoaded ? '' : 'loading'}`}
            src={MONTH_IMAGES[month]}
            alt={`${MONTHS[month]} landscape`}
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />
          <div className="hero-overlay">
            <span className="hero-year">{year}</span>
            <div className="hero-month-row">
              <button
                className="month-side-btn"
                onClick={() => goMonth(-1)}
                id="btn-prev-month"
                aria-label="Go to previous month"
              >
                &#8249;
              </button>
              <span className="hero-month">{MONTHS[month]}</span>
              <button
                className="month-side-btn"
                onClick={() => goMonth(1)}
                id="btn-next-month"
                aria-label="Go to next month"
              >
                &#8250;
              </button>
            </div>
          </div>

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <ThemeIcon theme={theme} />
          </button>

        </div>

        <div className="lower-section">
          <div className="notes-panel">
            <div className="notes-title">Notes</div>
            <div className="notes-lines">
              {currentNotes.map((line, i) => (
                <div className="note-line-row" key={i}>
                  <input
                    className="note-input"
                    type="text"
                    value={line}
                    placeholder="..."
                    onChange={(e) => updateNote(i, e.target.value)}
                    id={`note-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid-panel">
            <div className="day-headers">
              {DAYS_SHORT.map((d, i) => (
                <div key={d} className={`day-header ${isWeekend(i) ? 'weekend' : ''}`}>{d}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div className="week-row" key={wi}>
                {week.map((day, di) => {
                  const dayNumber = day.day
                  const isCurrentMonthDay = day.inCurrentMonth
                  const rInfo = isCurrentMonthDay ? getRangeInfo(dayNumber) : null
                  const rColors = rInfo ? RANGE_COLORS[rInfo.colorIdx] : null
                  const showRangeLabel = Boolean(
                    isCurrentMonthDay &&
                    rInfo?.label &&
                    (
                      (rInfo.end && dayNumber === Math.floor((rInfo.start + rInfo.end) / 2)) ||
                      (!rInfo.end && dayNumber === rInfo.start)
                    )
                  )

                  return (
                    <div
                      key={di}
                      className={[
                        'day-cell',
                        !isCurrentMonthDay ? 'adjacent-month' : '',
                        isWeekend(di) ? 'weekend' : '',
                        isToday(dayNumber, isCurrentMonthDay) ? 'today' : '',
                        rInfo ? (rInfo.type.includes('start') ? 'range-start' : rInfo.type === 'end' ? 'range-end' : 'in-range') : '',
                        rInfo?.type === 'start end animate' ? 'range-end' : ''
                      ].filter(Boolean).join(' ')}
                      style={rInfo ? {
                        '--range-edge': rColors.edge,
                        '--range-bg': rColors.bg
                      } : {}}
                      onClick={() => {
                        if (isCurrentMonthDay) handleDayClick(dayNumber)
                      }}
                    >
                      <span className="day-num">{dayNumber}</span>
                      {showRangeLabel && (
                        <span className="range-label-chip" title={rInfo.label}>
                          {rInfo.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {currentRanges.length > 0 && (
          <div className="range-manager">
            <div className="range-manager-title">
              Active Ranges
            </div>
            <div className="range-list">
              {currentRanges.map((r) => (
                <div className="range-item" key={r.id}>
                  <div className="range-item-header">
                    <span className="range-item-dates">
                      {MONTHS[month].slice(0, 3)} {r.start}
                      {r.end ? ` → ${MONTHS[month].slice(0, 3)} ${r.end}` : ' ... Selecting'}
                    </span>
                    <button className="range-delete-btn" onClick={() => deleteRange(r.id)}>×</button>
                  </div>

                  <div className="range-input-row">
                    <input
                      className="range-label-input"
                      type="text"
                      placeholder="Label (e.g. Vacation)"
                      value={r.label}
                      onChange={(e) => updateRange(r.id, { label: e.target.value })}
                    />
                    <div className="color-dots">
                      {RANGE_COLORS.map((c, ci) => (
                        <div
                          key={ci}
                          className={`color-dot ${r.colorIdx === ci ? 'active' : ''}`}
                          style={{ backgroundColor: c.edge }}
                          onClick={() => updateRange(r.id, { colorIdx: ci })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
