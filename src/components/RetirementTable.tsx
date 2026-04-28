import { useState } from 'react'
import { Retiree } from '../types'

function calcDday(dateStr: string): number | null {
  if (!dateStr || dateStr === '미정') return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function DdayBadge({ dateStr }: { dateStr: string }) {
  const d = calcDday(dateStr)
  if (d === null) return <span style={{ fontSize: 12, color: '#6b7280' }}>미정</span>
  if (d === 0) return <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>D-day</span>
  if (d < 0) return <span style={{ fontSize: 12, color: '#6b7280' }}>D+{Math.abs(d)}</span>
  if (d <= 3) return <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>D-{d}</span>
  if (d <= 7) return <span style={{ fontSize: 12, color: '#b45309' }}>D-{d}</span>
  return <span style={{ fontSize: 12, color: '#065f46' }}>D-{d}</span>
}

function StatusBadge({ status }: { status: string }) {
  if (status === '퇴직완료') return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f3f4f6', color: '#9ca3af', fontWeight: 500 }}>퇴직완료</span>
  if (status === '대기중') return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', fontWeight: 500 }}>대기중</span>
  return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#e0e7ff', color: '#3730a3', fontWeight: 500 }}>미정</span>
}

type Tab = 'all' | '대기중' | '퇴직완료' | '미정'

export default function RetirementTable({ data, onRefresh }: { data: Retiree[], onRefresh: () => void }) {
  const [tab, setTab] = useState<Tab>('all')
  const [monthFilter, setMonthFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = data.filter(r => {
    if (tab === '대기중' && r.status !== '대기중') return false
    if (tab === '퇴직완료' && r.status !== '퇴직완료') return false
    if (tab === '미정' && r.lastDayDate !== '미정') return false
    if (monthFilter && r.lastDayDate !== '미정') {
      const m = new Date(r.lastDayDate).getMonth() + 1
      if (String(m) !== monthFilter) return false
    }
    if (search && !r.name.includes(search)) return false
    return true
  }).sort((a, b) => {
    if (a.lastDayDate === '미정' && b.lastDayDate === '미정') return 0
    if (a.lastDayDate === '미정') return 1
    if (b.lastDayDate === '미정') return -1
    if (a.status === '퇴직완료' && b.status !== '퇴직완료') return 1
    if (a.status !== '퇴직완료' && b.status === '퇴직완료') return -1
    return new Date(a.lastDayDate).getTime() - new Date(b.lastDayDate).getTime()
  })

  const tabs: { key: Tab, label: string }[] = [
    { key: 'all', label: '전체' },
    { key: '대기중', label: '대기중' },
    { key: '퇴직완료', label: '퇴직완료' },
    { key: '미정', label: '미정' },
  ]

  const thStyle = { background: '#f9fafb', color: '#6b7280', fontWeight: 500, padding: '10px 12px', textAlign: 'left' as const, borderBottom: '0.5px solid #e5e7eb', fontSize: 13 }
  const tdStyle = { padding: '10px 12px', borderBottom: '0.5px solid #f3f4f6', fontSize: 13, color: '#111827', verticalAlign: 'middle' as const }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '0.5px solid #e5e7eb', marginBottom: '1rem' }}>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{ fontSize: 13, padding: '7px 14px', cursor: 'pointer', color: tab === t.key ? '#1e3a8a' : '#6b7280', borderBottom: tab === t.key ? '2px solid #1e3a8a' : '2px solid transparent', fontWeight: tab === t.key ? 500 : 400, marginBottom: -1 }}>
            {t.label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ fontSize: 13, padding: '6px 10px', border: '0.5px solid #d1d5db', borderRadius: 8, background: '#fff', color: '#111827' }}>
          <option value=''>전체 월</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1)}>{i + 1}월</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder='이름 검색' style={{ fontSize: 13, padding: '6px 10px', border: '0.5px solid #d1d5db', borderRadius: 8, width: 120, color: '#111827' }} />
        <button onClick={onRefresh} style={{ fontSize: 13, padding: '6px 14px', border: '0.5px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#374151', marginLeft: 'auto' }}>새로고침</button>
      </div>
      <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 80 }}>성명</th>
              <th style={{ ...thStyle, width: 110 }}>부서명</th>
              <th style={{ ...thStyle, width: 100 }}>직급</th>
              <th style={{ ...thStyle, width: 100 }}>마지막 출근일</th>
              <th style={{ ...thStyle, width: 70 }}>D-day</th>
              <th style={{ ...thStyle, width: 90 }}>상태</th>
              <th style={{ ...thStyle, width: 70, textAlign: 'center' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>데이터가 없습니다.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.name} style={{ opacity: r.status === '퇴직완료' ? 0.4 : 1, background: r.status === '퇴직완료' ? '#f9fafb' : 'transparent' }}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{r.name}</td>
                <td style={tdStyle}>{r.dept}</td>
                <td style={{ ...tdStyle, color: '#6b7280' }}>{r.grade}</td>
                <td style={tdStyle}>{r.lastDayDate}</td>
                <td style={tdStyle}><DdayBadge dateStr={r.lastDayDate} /></td>
                <td style={tdStyle}><StatusBadge status={r.status} /></td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
