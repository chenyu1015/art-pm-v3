import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取风险列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const risks = await prisma.risk.findMany({
      where,
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(risks)
  } catch (error) {
    return NextResponse.json({ error: '获取风险失败' }, { status: 500 })
  }
}

// 创建风险
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // 自动计算风险等级
    const score = (data.probability || 3) * (data.impact || 3)
    const level = score >= 15 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low'
    
    const risk = await prisma.risk.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        category: data.category,
        probability: data.probability || 3,
        impact: data.impact || 3,
        level,
        ownerId: data.ownerId,
        strategy: data.strategy,
        status: data.status || 'new'
      }
    })

    return NextResponse.json(risk)
  } catch (error) {
    return NextResponse.json({ error: '创建风险失败' }, { status: 500 })
  }
}
