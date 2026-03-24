'use client'

import { Card, Badge, Calendar, List, Tag } from '@arco-design/web-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setEvents(data.calendarEvents || []))
  }, [])

  const getEventsForDate = (date: dayjs.Dayjs) => {
    return events.filter(event => {
      return dayjs(event.date).isSame(date, 'day')
    })
  }

  return (
    <div className="space-y-4">
      <Card title="交付日历">
        <Calendar
          panel
          dateRender={(currentDate: dayjs.Dayjs) => {
            const dayEvents = getEventsForDate(currentDate)
            return (
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event: any) => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded truncate ${
                      event.type === 'milestone'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400">+{dayEvents.length - 3}</div>
                )}
              </div>
            )
          }}
        />
      </Card>

      <Card title="即将到期（未来30天）">
        <List
          dataSource={events.slice(0, 10)}
          render={(event: any) => (
            <List.Item>
              <div className="flex items-center gap-4">
                <Badge
                  dot
                  color={event.type === 'milestone' ? '#F53F3F' : '#165DFF'}
                />
                <span className="text-gray-500 w-24">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="flex-1 font-medium">{event.title}</span>
                <Tag color={event.type === 'milestone' ? 'red' : 'blue'}>
                  {event.type === 'milestone' ? '里程碑' : '任务'}
                </Tag>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
