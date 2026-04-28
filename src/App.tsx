import { useEffect, useState } from 'react'
import { Retiree } from './types'
import MetricCards from './components/MetricCards'
import AlertBox from './components/AlertBox'
import MonthlyChart from './components/MonthlyChart'
import RetirementTable from './components/RetirementTable'
import NotificationBell from './components/NotificationBell'

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
const SHEET_ID = import.meta.env.VITE_SHEET_ID
const SHEET_NAME = '퇴직자 정보'

function normalizeDate(val: string): string {
  if (!val || val.trim() === '' || val === '미정') return '미정'
  const trimmed = val.trim()
  const parts = trimmed.split(/[\/\-]/)
  if (parts.length !== 3) return trimmed
  let [y, m, d] = parts
  if (y.length === 2) y = '20' + y
  m = m.padStart(2, '0')
  d = d.padStart(2, '0')
  return `${y}-${m}-${d}`
}
export default function App() {
  const [data, setData] = useState<Retiree[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSheet()
  }, [])

  async function fetchSheet() {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`
      const res = await fetch(url)
      const json = await res.json()
      const rows: string[][] = json.values?.slice(1) || []
      const parsed: Retiree[] = rows
        .filter(r => r[0])
        .map(r => {
  const lastDayDate = normalizeDate(r[5])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastDay = new Date(lastDayDate)
  lastDay.setHours(0, 0, 0, 0)
  const isPast = lastDayDate !== '미정' && lastDay < today
  const manualStatus = r[7] as '대기중' | '퇴직완료'
  const status = manualStatus || (isPast ? '퇴직완료' : '대기중')
  return {
    name: r[0] || '',
    dept: r[1] || '',
    grade: r[2] || '',
    lastWorkDate: normalizeDate(r[3]),
    ghrDate: normalizeDate(r[4]),
    lastDayDate,
    note: r[6] || '',
    status,
    registeredAt: r[8] || '',
    alertSentAt: r[9] || '',
    alertCount: Number(r[10]) || 0,
  }
})
      setData(parsed)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
      불러오는 중...
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'Pretendard, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>퇴직자 모니터링 대시보드</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>관리자: 정보보안/인프라팀 조아연님</p>
        </div>
        <NotificationBell data={data} />
      </div>
      <MetricCards data={data} />
      <AlertBox data={data} />
      <MonthlyChart data={data} />
      <RetirementTable data={data} onRefresh={fetchSheet} />
    </div>
  )
}
