'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setEvents(data.calendarEvents || []))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">交付日历</h1>
          <p className="text-white/50 mt-1">查看里程碑和任务交付日期</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ←
          </button>
          <span className="text-xl font-semibold text-white/90 min-w-[140px] text-center">
            {year}年 {month + 1}月
          </span>
          <button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            →
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
          <span className="text-sm text-white/60">里程碑</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          <span className="text-sm text-white/60">任务截止</span>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="glass-card overflow-hidden">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
          {weekDays.map(day => (
            <div key={day} className="py-4 text-center text-sm font-medium text-white/40">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {/* 空白天数 */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-28 border-b border-r border-white/5 bg-white/[0.02]" />
          ))}

          {/* 日期 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, month, i + 1)
            const dayEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div 
                key={i} 
                className={`min-h-28 border-b border-r border-white/5 p-2 transition-colors ${
                  isToday ? 'bg-violet-500/10' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className={`text-sm mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday 
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-medium' 
                    : 'text-white/50'
                }`}>
                  {i + 1}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div 
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded-lg truncate ${
                        event.type === 'milestone' 
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' 
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-white/30 pl-2">
                      +{dayEvents.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 即将到期列表 */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white/90 mb-4">即将到期（未来30天）</h2>
        <div className="space-y-2">
          {events.slice(0, 10).map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 rounded-lg transition-colors">
              <span className={`w-3 h-3 rounded-full ${
                event.type === 'milestone' 
                  ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' 
                  : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              }`} />
              <span className="text-sm text-white/40 w-24">
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex-1 text-sm font-medium text-white/80">{event.title}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${
                event.type === 'milestone' 
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {event.type === 'milestone' ? '里程碑' : '任务'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
