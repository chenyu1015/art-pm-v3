import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/costs - 获取所有费用
export async function GET() {
  const costs = await prisma.cost.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(costs)
}

// POST /api/costs - 创建新费用
export async function POST(request: Request) {
  const data = await request.json()
  const cost = await prisma.cost.create({
    data: {
      projectId: data.projectId,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date()
    }
  })
  return NextResponse.json(cost)
}
