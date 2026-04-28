import { useEffect, useRef, useState } from 'react'
import { Retiree } from '../types'

function calcDday(dateStr: string): number | null {
  if (!dateStr || dateStr === '미정') return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export default function NotificationBell({ data }: { data: Retiree[] }) {
  const [open, setOpen] = useState(false)
  const [permitted, setPermitted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const todayAlerts = data.filter(r => {
    const d = calcDday(r.lastDayDate)
    return d === 0 && r.status !== '퇴직완료'
  })

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermitted(true)
    }
  }, [])

  useEffect(() => {
    if (!permitted || todayAlerts.length === 0) return
    const now = new Date()
    const target = new Date()
    target.setHours(9, 0, 0, 0)
    const diff = target.getTime() - now.getTime()
    if (diff < 0 || diff > 60000) return
    const timer = setTimeout(() => {
      todayAlerts.forEach(r => {
        new Notification('퇴직자 알람', {
          body: `${r.name} · ${r.dept} · 오늘 마지막 출근일`,
          icon: '/favicon.ico',
        })
      })
    }, diff)
    return () => clearTimeout(timer)
  }, [permitted, todayAlerts])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function requestPermission() {
    const result = await Notification.requestPermission()
    if (result === 'granted') setPermitted(true)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ position: 'relative', background: 'none', border: '0.5px solid #d1d5db', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
      >
        🔔
        {todayAlerts.length > 0 && (
          <span style={{ position: 'absolute', top: -6, right: -6, background: '#991b1b', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '2px 5px', minWidth: 16, textAlign: 'center' }}>
            {todayAlerts.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 100 }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #f3f4f6', fontSize: 13, fontWeight: 500, color: '#111827' }}>
            오늘 알람 현황
          </div>

          {todayAlerts.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              오늘 마지막 출근일인 퇴직자가 없습니다.
            </div>
          ) : (
            todayAlerts.map(r => (
              <div key={r.name} style={{ padding: '10px 16px', borderBottom: '0.5px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{r.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{r.dept} · {r.grade}</span>
                <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 500 }}>오늘 마지막 출근일</span>
              </div>
            ))
          )}

          {!permitted && (
            <div style={{ padding: '12px 16px', borderTop: '0.5px solid #f3f4f6' }}>
              <button onClick={requestPermission} style={{ width: '100%', fontSize: 12, padding: '7px', border: '0.5px solid #1e3a8a', borderRadius: 8, background: '#fff', color: '#1e3a8a', cursor: 'pointer' }}>
                브라우저 푸시 알람 허용
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
