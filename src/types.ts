export interface Retiree {
  name: string
  dept: string
  grade: string
  lastWorkDate: string
  ghrDate: string
  lastDayDate: string
  note: string
  status: '대기중' | '퇴직완료'
  registeredAt: string
  alertSentAt: string
  alertCount: number
}
