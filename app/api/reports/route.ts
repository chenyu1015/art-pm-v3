import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取报表数据
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const type = searchParams.get('type') || 'overview'

    // 基础统计
    const stats = {
      // 项目统计
      totalProjects: await prisma.project.count(),
      activeProjects: await prisma.project.count({ where: { status: 'active' } }),
      
      // 任务统计
      totalTasks: await prisma.task.count(projectId ? { where: { projectId } } : undefined),
      taskByStatus: await prisma.task.groupBy({
        by: ['status'],
        where: projectId ? { projectId } : undefined,
        _count: { status: true }
      }),
      
      // 人员统计
      totalPersons: await prisma.person.count({ where: { status: 'active' } }),
      
      // 成本统计
      totalCost: await prisma.cost.aggregate({
        where: projectId ? { projectId } : undefined,
        _sum: { amount: true }
      }),
      
      // 外包统计
      outsourceOrders: await prisma.outsourceOrder.count(projectId ? { where: { projectId } } : undefined),
      outsourceAmount: await prisma.outsourceOrder.aggregate({
        where: projectId ? { projectId } : undefined,
        _sum: { contractPrice: true }
      }),
      
      // 风险统计
      riskByLevel: await prisma.risk.groupBy({
        by: ['level'],
        where: projectId ? { projectId } : undefined,
        _count: { level: true }
      })
    }

    // 管线进度统计
    const pipelineStats = await prisma.pipeline.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } }
      }
    })

    // 计算每个管线的完成率
    const pipelineProgress = pipelineStats.map(p => {
      const total = p._count.tasks
      const done = p.tasks.filter(t => t.status === 'done').length
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        total,
        done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0
      }
    })

    // 近期完成任务趋势（按周）
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const weeklyTasks = await prisma.task.groupBy({
      by: ['status'],
      where: {
        ...((projectId ? { projectId } : {})),
        updatedAt: { gte: fourWeeksAgo }
      },
      _count: { status: true }
    })

    return NextResponse.json({
      type,
      stats,
      pipelineProgress,
      weeklyTasks
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: '获取报表失败' }, { status: 500 })
  }
}
