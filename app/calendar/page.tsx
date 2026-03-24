'use client'

import { useEffect, useState } from 'react'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">交付日历</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <span className="text-lg font-medium">
            {year}年 {month + 1}月
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            →
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>里程碑</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span>任务截止</span>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {/* 空白天数 */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50" />
          ))}

          {/* 日期 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, month, i + 1)
            const dayEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div 
                key={i} 
                className={`min-h-24 border-b border-r border-gray-100 p-2 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                  {i + 1}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <div 
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded truncate ${
                        event.type === 'milestone' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-medium text-gray-900 mb-4">即将到期（未来30天）</h2>
        <div className="space-y-2">
          {events.slice(0, 10).map((event: any) => (
            <div key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <span className={`w-2 h-2 rounded-full ${
                event.type === 'milestone' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <span className="text-sm text-gray-500 w-24">
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex-1 text-sm font-medium">{event.title}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                event.type === 'milestone' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-blue-100 text-blue-600'
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
