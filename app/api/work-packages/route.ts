import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取工作包列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const releaseId = searchParams.get('releaseId')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (releaseId) where.releaseId = releaseId

    const workPackages = await prisma.workPackage.findMany({
      where,
      include: {
        pipeline: { select: { id: true, name: true, color: true } },
        release: { select: { id: true, name: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workPackages)
  } catch (error) {
    return NextResponse.json({ error: '获取工作包失败' }, { status: 500 })
  }
}

// 创建工作包
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // 自动计算预估成本
    const estimatedCost = data.standardPersonDays 
      ? data.standardPersonDays * 1000 * (data.sourceType === 'outsource' ? 1.5 : 1)
      : null
    
    const workPackage = await prisma.workPackage.create({
      data: {
        projectId: data.projectId,
        pipelineId: data.pipelineId,
        releaseId: data.releaseId,
        title: data.title,
        description: data.description,
        status: data.status || 'planning',
        priority: data.priority || 'P2',
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
        plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
        standardPersonDays: data.standardPersonDays,
        estimatedCost,
        sourceType: data.sourceType || 'internal',
        quarter: data.quarter
      },
      include: {
        pipeline: { select: { id: true, name: true, color: true } }
      }
    })

    return NextResponse.json(workPackage)
  } catch (error) {
    return NextResponse.json({ error: '创建工作包失败' }, { status: 500 })
  }
}
