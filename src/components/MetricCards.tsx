import { Retiree } from '../types'

export default function MetricCards({ data }: { data: Retiree[] }) {
  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()

  const total = data.length
  const thisMonthCount = data.filter(r => {
    if (r.lastDayDate === '미정') return false
    const d = new Date(r.lastDayDate)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length
  const completed = data.filter(r => r.status === '퇴직완료').length
  const undecided = data.filter(r => r.lastDayDate === '미정').length

  const cards = [
    { label: '전체 등록', value: total, unit: '명', color: '#111827' },
    { label: '이번달 퇴직 예정', value: thisMonthCount, unit: '명', color: '#b45309' },
    { label: '퇴직 완료', value: completed, unit: '명', color: '#065f46' },
    { label: '미정 (날짜 미확정)', value: undecided, unit: '명', color: '#991b1b' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: c.color }}>
            {c.value}<span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>{c.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
