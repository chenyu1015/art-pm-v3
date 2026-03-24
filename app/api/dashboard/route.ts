import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取 Dashboard 数据
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    // 基础统计
    const stats = {
      totalProjects: await prisma.project.count(),
      activeProjects: await prisma.project.count({ where: { status: 'active' } }),
      totalTasks: await prisma.task.count(),
      pendingTasks: await prisma.task.count({ where: { status: 'todo' } }),
      inProgressTasks: await prisma.task.count({ where: { status: 'in_progress' } }),
      completedTasks: await prisma.task.count({ where: { status: 'done' } }),
      totalPersons: await prisma.person.count({ where: { status: 'active' } }),
      upcomingMilestones: await prisma.milestone.count({ 
        where: { 
          status: { in: ['upcoming', 'active'] },
          plannedDate: { gte: new Date() }
        } 
      })
    }

    // 项目列表（带进度）
    const projects = await prisma.project.findMany({
      where: projectId ? { id: projectId } : undefined,
      include: {
        _count: { 
          select: { 
            tasks: true
          } 
        },
        milestones: {
          where: { status: { in: ['upcoming', 'active'] } },
          orderBy: { plannedDate: 'asc' },
          take: 3
        }
      },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    })

    // 计算每个项目的进度
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: { status: true }
        })
        
        const total = taskStats.reduce((sum, s) => sum + s._count.status, 0)
        const done = taskStats.find(s => s.status === 'done')?._count.status || 0
        const progress = total > 0 ? Math.round((done / total) * 100) : 0

        return {
          ...project,
          progress,
          taskTotal: total
        }
      })
    )

    // 即将到期的任务（未来7天）
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const upcomingTasks = await prisma.task.findMany({
      where: {
        status: { not: 'done' },
        plannedEnd: { lte: nextWeek, gte: new Date() }
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        pipeline: { select: { id: true, name: true, color: true } }
      },
      take: 10,
      orderBy: { plannedEnd: 'asc' }
    })

    // 交付日历数据（未来30天）
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)
    
    const [milestones, tasks] = await Promise.all([
      prisma.milestone.findMany({
        where: {
          plannedDate: { lte: nextMonth, gte: new Date() }
        },
        select: {
          id: true,
          name: true,
          plannedDate: true,
          status: true
        }
      }),
      prisma.task.findMany({
        where: {
          plannedEnd: { lte: nextMonth, gte: new Date() },
          status: { not: 'done' }
        },
        select: {
          id: true,
          title: true,
          plannedEnd: true,
          status: true,
          pipelineId: true
        }
      })
    ])

    const calendarEvents = [
      ...milestones.map(m => ({
        id: `m-${m.id}`,
        title: m.name,
        date: m.plannedDate,
        type: 'milestone',
        status: m.status
      })),
      ...tasks.map(t => ({
        id: `t-${t.id}`,
        title: t.title,
        date: t.plannedEnd,
        type: 'task',
        status: t.status
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      stats,
      projects: projectsWithProgress,
      upcomingTasks,
      calendarEvents
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: '获取Dashboard失败' }, { status: 500 })
  }
}
