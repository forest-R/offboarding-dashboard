import { useEffect, useState } from 'react'
import { Retiree } from './types'
import MetricCards from './components/MetricCards'
import AlertBox from './components/AlertBox'
import MonthlyChart from './components/MonthlyChart'
import RetirementTable from './components/RetirementTable'

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
const SHEET_ID = import.meta.env.VITE_SHEET_ID
const SHEET_NAME = '퇴직자 정보'

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
        .map(r => ({
          name: r[0] || '',
          dept: r[1] || '',
          grade: r[2] || '',
          lastWorkDate: r[3] || '미정',
          ghrDate: r[4] || '미정',
          lastDayDate: r[5] || '미정',
          note: r[6] || '',
          status: (r[7] as '대기중' | '퇴직완료') || '대기중',
          registeredAt: r[8] || '',
          alertSentAt: r[9] || '',
          alertCount: Number(r[10]) || 0,
        }))
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
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>관리자: 인사팀</p>
        </div>
      </div>
      <MetricCards data={data} />
      <AlertBox data={data} />
      <MonthlyChart data={data} />
      <RetirementTable data={data} onRefresh={fetchSheet} />
    </div>
  )
}
