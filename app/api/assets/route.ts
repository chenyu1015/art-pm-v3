import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取资产列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (projectId) where.projectId = projectId

    const assets = await prisma.asset.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        stages: {
          include: {
            pipeline: { select: { id: true, name: true, color: true } }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: '获取资产失败' }, { status: 500 })
  }
}

// 创建资产
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // 获取项目的管线配置来创建 stages
    const pipelines = await prisma.pipeline.findMany({
      where: { projectId: data.projectId, isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    const asset = await prisma.asset.create({
      data: {
        projectId: data.projectId,
        releaseId: data.releaseId,
        name: data.name,
        assetType: data.assetType,
        description: data.description,
        priority: data.priority || 'P2',
        tags: data.tags || [],
        stages: {
          create: pipelines.map((p, i) => ({
            pipelineId: p.id,
            status: 'not_started',
            sortOrder: i
          }))
        }
      },
      include: {
        stages: {
          include: {
            pipeline: { select: { id: true, name: true, color: true } }
          }
        }
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: '创建资产失败' }, { status: 500 })
  }
}
