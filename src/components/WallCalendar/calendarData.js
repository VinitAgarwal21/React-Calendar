import januaryImage from './images/january.jpg'
import februaryImage from './images/february.jpg'
import marchImage from './images/march.jpg'
import aprilImage from './images/april.jpg'
import mayImage from './images/may.jpg'
import juneImage from './images/june.jpg'
import julyImage from './images/july.jpg'
import augustImage from './images/august.jpg'
import septemberImage from './images/september.jpg'
import octoberImage from './images/october.jpg'
import novemberImage from './images/november.jpg'
import decemberImage from './images/december.jpg'

export const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
]

export const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const MONTH_IMAGES = {
  0: januaryImage,
  1: februaryImage,
  2: marchImage,
  3: aprilImage,
  4: mayImage,
  5: juneImage,
  6: julyImage,
  7: augustImage,
  8: septemberImage,
  9: octoberImage,
  10: novemberImage,
  11: decemberImage,
}

export const MONTH_ACCENTS = {
  0: '#1a8fd1',
  1: '#c45b8a',
  2: '#6abf69',
  3: '#e8a838',
  4: '#47b881',
  5: '#2196f3',
  6: '#ff7043',
  7: '#8e6bbf',
  8: '#d4783e',
  9: '#e05555',
  10: '#8b6914',
  11: '#3d8b8b',
}

export const RANGE_COLORS = [
  { name: 'Blue', bg: 'rgba(26, 143, 209, 0.15)', edge: '#1a8fd1' },
  { name: 'Rose', bg: 'rgba(225, 29, 72, 0.15)', edge: '#e11d48' },
  { name: 'Green', bg: 'rgba(22, 163, 74, 0.15)', edge: '#16a34a' },
  { name: 'Purple', bg: 'rgba(147, 51, 234, 0.15)', edge: '#9333ea' },
  { name: 'Amber', bg: 'rgba(217, 119, 6, 0.15)', edge: '#d97706' },
  { name: 'Teal', bg: 'rgba(13, 148, 136, 0.15)', edge: '#0d9488' },
]


export function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  let startIndex = firstDay.getDay() - 1
  if (startIndex < 0) startIndex = 6

  const cells = []

  for (let i = startIndex - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      inCurrentMonth: false
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      inCurrentMonth: true
    })
  }

  let nextMonthDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextMonthDay++,
      inCurrentMonth: false
    })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return weeks
}
