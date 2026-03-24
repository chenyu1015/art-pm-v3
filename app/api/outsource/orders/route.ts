import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取外包订单列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const orders = await prisma.outsourceOrder.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true, rating: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: '获取外包订单失败' }, { status: 500 })
  }
}

// 创建外包订单
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const order = await prisma.outsourceOrder.create({
      data: {
        projectId: data.projectId,
        vendorId: data.vendorId,
        pipelineId: data.pipelineId,
        workPackageId: data.workPackageId,
        title: data.title,
        assetList: data.assetList,
        techSpec: data.techSpec,
        standardPersonDays: data.standardPersonDays,
        quotedPrice: data.quotedPrice,
        contractPrice: data.contractPrice,
        plannedDelivery: data.plannedDelivery ? new Date(data.plannedDelivery) : null,
        createdById: data.createdById
      },
      include: {
        vendor: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: '创建外包订单失败' }, { status: 500 })
  }
}
