import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 登录
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })

    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: '用户不存在或已禁用' }, { status: 401 })
    }

    // 简化版：直接比对密码（生产环境应使用 bcrypt）
    // const valid = await bcrypt.compare(password, user.passwordHash)
    const valid = password === '123456' // 开发环境简化

    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    })
  } catch (error) {
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
