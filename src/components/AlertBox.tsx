import { Retiree } from '../types'

function calcDday(dateStr: string): number | null {
  if (!dateStr || dateStr === '미정') return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export default function AlertBox({ data }: { data: Retiree[] }) {
  const alerts = data.filter(r => {
    const d = calcDday(r.lastDayDate)
    return d !== null && d >= 0 && d <= 3 && r.status !== '퇴직완료'
  }).sort((a, b) => {
    const da = calcDday(a.lastDayDate) ?? 99
    const db = calcDday(b.lastDayDate) ?? 99
    return da - db
  })

  if (alerts.length === 0) return null

  return (
    <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>오늘 마지막 출근일 / D-3 이내 알람</div>
      {alerts.map(r => {
        const d = calcDday(r.lastDayDate)
        const label = d === 0 ? '오늘 마지막 출근일' : `D-${d} (${r.lastDayDate})`
        return (
          <div key={r.name} style={{ fontSize: 12, color: '#7f1d1d', padding: '4px 0', borderBottom: '0.5px solid #fecaca', display: 'flex', justifyContent: 'space-between' }}>
            <span>{r.name} · {r.dept} · {r.grade}</span>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
