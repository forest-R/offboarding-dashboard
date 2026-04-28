import { useState } from 'react'
import { Retiree } from '../types'

export default function MonthlyChart({ data }: { data: Retiree[] }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from(new Set(
    data
      .filter(r => r.lastDayDate !== '미정')
      .map(r => new Date(r.lastDayDate).getFullYear())
  )).sort()
  if (!years.includes(currentYear)) years.push(currentYear)
  years.sort()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const months = Array.from({ length: 12 }, (_, i) => i)

  const counts = months.map(m => {
    const completed = data.filter(r => {
      if (r.lastDayDate === '미정') return false
      const d = new Date(r.lastDayDate)
      return d.getFullYear() === selectedYear && d.getMonth() === m && r.status === '퇴직완료'
    }).length
    const pending = data.filter(r => {
      if (r.lastDayDate === '미정') return false
      const d = new Date(r.lastDayDate)
      return d.getFullYear() === selectedYear && d.getMonth() === m && r.status !== '퇴직완료'
    }).length
    return { completed, pending }
  })

  const max = Math.max(...counts.map(c => c.completed + c.pending), 1)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>월별 퇴직자 현황</div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          style={{ fontSize: 13, padding: '4px 8px', border: '0.5px solid #d1d5db', borderRadius: 8, background: '#fff', color: '#111827' }}
        >
          {years.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {counts.map((c, i) => {
          const total = c.completed + c.pending
          const completedPct = (c.completed / max) * 100
          const pendingPct = (c.pending / max) * 100
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', width: 32, textAlign: 'right', flexShrink: 0 }}>{i + 1}월</span>
              <div style={{ flex: 1, height: 20, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                {c.completed > 0 && (
                  <div style={{ width: `${completedPct}%`, background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{c.completed}</span>
                  </div>
                )}
                {c.pending > 0 && (
                  <div style={{ width: `${pendingPct}%`, background: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                    <span style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 500 }}>{c.pending}</span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#6b7280', width: 20 }}>{total || ''}</span>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
        {[{ color: '#1e3a8a', label: '완료' }, { color: '#93c5fd', label: '예정' }].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }}></span>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
