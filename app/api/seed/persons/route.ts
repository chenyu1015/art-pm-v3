import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 初始化部门和人员数据
export async function POST(req: NextRequest) {
  try {
    // 先获取或创建工作室
    let studio = await prisma.studio.findFirst()
    if (!studio) {
      studio = await prisma.studio.create({
        data: { name: '主工作室', description: '默认工作室' }
      })
    }

    // 部门配置
    const departmentsConfig = [
      { name: '角色原画', code: 'CHAR_CONCEPT' },
      { name: '角色模型', code: 'CHAR_MODEL' },
      { name: '场景原画', code: 'SCENE_CONCEPT' },
      { name: '地编', code: 'LEVEL_DESIGN' },
      { name: '场景模型', code: 'SCENE_MODEL' },
      { name: 'UI', code: 'UI' },
      { name: '动作', code: 'ANIMATION' },
      { name: '特效', code: 'VFX' },
    ]

    // 人员数据
    const personsData: Record<string, string[]> = {
      '角色原画': ['高浩', '依文举', '沈蔡阳', 'Phil', 'hana', '盼达', '六一', '橙酒', '假七', '青稞', '小五', '王星力', '卢垒垒', '粟文柯', '侯雨婷', '罗通', '张晓蕾'],
      '角色模型': ['范龙', '袁冰', '楚河', '无名', '童巨侠', '毛圣阳', '消律', '云铭', '李慧明', '刘佳仪', '卢长乐', '黄胧', '大瓶子', '圈圈', '莫天傲', '乐英', '李培如', '袁艳玲', '李少华', '魏东林', '刘一璐'],
      '场景原画': ['高程松', '辉子', '黄洋', '许涵', '张晗', '李莹', '宋正泽', '张瑞昌', '肖恩桂', '偏偏', '江培林'],
      '地编': ['张雪松', '老七', '董海伟', '尔东', '狗叽', '安科', '李智飞', '雷婷', '张勇超', '任全欣', '李一鸣', '李丁', '贾晓艳'],
      '场景模型': ['闫汉', '张敬恒', '黄国桐', '甲壳虫', '王卉彤', '安妮', '莲子', '包子貘', '李宏瀚', '孙伟楠', '心悦', '杨磊', '王舒瑶', '崔寅达'],
      'UI': ['橙子', '张青', '支众韬', '杨艳', '泡泡', '高子晶', '郎雪娇'],
      '动作': ['卢强', '张淼祥', '腰果', '九安', '何伟', '传生', '阿颂', '石文辉', '苏仕鑫', '李欣彤', '赵泓烨', '郑洋', '荣波', '宋旺'],
      '特效': ['刘鹏', '刘璐', '吴君铭', '桃子', '刘恒聚', '薛鹏鑫', '李照鑫', '王志成', '钟佳', '李东华', '刘超', '徐琛', '李一康', '张珂鸣', '黎家鑫', 'Link', '王煜程', '李邦景'],
    }

    const results = {
      departments: 0,
      persons: 0,
      errors: [] as string[]
    }

    // 创建部门
    for (let i = 0; i < departmentsConfig.length; i++) {
      const deptConfig = departmentsConfig[i]
      
      let department = await prisma.department.findFirst({
        where: { name: deptConfig.name, studioId: studio.id }
      })

      if (!department) {
        department = await prisma.department.create({
          data: {
            name: deptConfig.name,
            studioId: studio.id,
            sortOrder: i
          }
        })
        results.departments++
      }

      // 为该部门创建人员
      const names = personsData[deptConfig.name] || []
      for (const name of names) {
        try {
          const existingPerson = await prisma.person.findFirst({
            where: { name, departmentId: department.id }
          })

          if (!existingPerson) {
            await prisma.person.create({
              data: {
                name,
                email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@artpm.com`,
                departmentId: department.id,
                skills: [deptConfig.name],
                status: 'active'
              }
            })
            results.persons++
          }
        } catch (err: any) {
          results.errors.push(`Failed to create ${name}: ${err.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据初始化完成',
      data: results
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: '初始化失败', 
      details: error.message 
    }, { status: 500 })
  }
}
