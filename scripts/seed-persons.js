const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 获取或创建工作室
  let studio = await prisma.studio.findFirst()
  if (!studio) {
    studio = await prisma.studio.create({
      data: { name: '主工作室', description: '默认工作室' }
    })
    console.log('✓ 创建工作室:', studio.name)
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
  const personsData = {
    '角色原画': ['高浩', '依文举', '沈蔡阳', 'Phil', 'hana', '盼达', '六一', '橙酒', '假七', '青稞', '小五', '王星力', '卢垒垒', '粟文柯', '侯雨婷', '罗通', '张晓蕾'],
    '角色模型': ['范龙', '袁冰', '楚河', '无名', '童巨侠', '毛圣阳', '消律', '云铭', '李慧明', '刘佳仪', '卢长乐', '黄胧', '大瓶子', '圈圈', '莫天傲', '乐英', '李培如', '袁艳玲', '李少华', '魏东林', '刘一璐'],
    '场景原画': ['高程松', '辉子', '黄洋', '许涵', '张晗', '李莹', '宋正泽', '张瑞昌', '肖恩桂', '偏偏', '江培林'],
    '地编': ['张雪松', '老七', '董海伟', '尔东', '狗叽', '安科', '李智飞', '雷婷', '张勇超', '任全欣', '李一鸣', '李丁', '贾晓艳'],
    '场景模型': ['闫汉', '张敬恒', '黄国桐', '甲壳虫', '王卉彤', '安妮', '莲子', '包子貘', '李宏瀚', '孙伟楠', '心悦', '杨磊', '王舒瑶', '崔寅达'],
    'UI': ['橙子', '张青', '支众韬', '杨艳', '泡泡', '高子晶', '郎雪娇'],
    '动作': ['卢强', '张淼祥', '腰果', '九安', '何伟', '传生', '阿颂', '石文辉', '苏仕鑫', '李欣彤', '赵泓烨', '郑洋', '荣波', '宋旺'],
    '特效': ['刘鹏', '刘璐', '吴君铭', '桃子', '刘恒聚', '薛鹏鑫', '李照鑫', '王志成', '钟佳', '李东华', '刘超', '徐琛', '李一康', '张珂鸣', '黎家鑫', 'Link', '王煜程', '李邦景'],
  }

  let deptCount = 0
  let personCount = 0

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
      deptCount++
      console.log(`✓ 创建部门: ${department.name}`)
    }

    // 为该部门创建人员
    const names = personsData[deptConfig.name] || []
    for (const name of names) {
      const existingPerson = await prisma.person.findFirst({
        where: { name, departmentId: department.id }
      })

      if (!existingPerson) {
        await prisma.person.create({
          data: {
            name,
            email: `${pinyin(name)}@artpm.com`,
            departmentId: department.id,
            skills: [deptConfig.name],
            status: 'active'
          }
        })
        personCount++
      }
    }
  }

  console.log(`\n✅ 完成! 创建了 ${deptCount} 个部门, ${personCount} 个人员`)
}

// 简单的拼音转换（用于生成邮箱）
function pinyin(name) {
  const pinyinMap = {
    '高浩': 'gaohao', '依文举': 'yiwenju', '沈蔡阳': 'shencaiyang', 'Phil': 'phil', 'hana': 'hana',
    '盼达': 'panda', '六一': 'liuyi', '橙酒': 'chengjiu', '假七': 'jiaqi', '青稞': 'qingke',
    '小五': 'xiaowu', '王星力': 'wangxingli', '卢垒垒': 'luleilei', '粟文柯': 'suwenke', '侯雨婷': 'houyuting',
    '罗通': 'luotong', '张晓蕾': 'zhangxiaolei', '范龙': 'fanlong', '袁冰': 'yuanbing', '楚河': 'chuhe',
    '无名': 'wuming', '童巨侠': 'tongjuxia', '毛圣阳': 'maoshengyang', '消律': 'xiaolv', '云铭': 'yunming',
    '李慧明': 'lihuiming', '刘佳仪': 'liujiayi', '卢长乐': 'luchangle', '黄胧': 'huanglong', '大瓶子': 'dapingzi',
    '圈圈': 'quanquan', '莫天傲': 'motianao', '乐英': 'leying', '李培如': 'lipeiru', '袁艳玲': 'yuanyanling',
    '李少华': 'lishaohua', '魏东林': 'weidonglin', '刘一璐': 'liuyilu', '高程松': 'gaochengsong', '辉子': 'huizi',
    '黄洋': 'huangyang', '许涵': 'xuhan', '张晗': 'zhanghan', '李莹': 'liying', '宋正泽': 'songzhengze',
    '张瑞昌': 'zhangruichang', '肖恩桂': 'xiaoengui', '偏偏': 'pianpian', '江培林': 'jiangpeilin',
    '张雪松': 'zhangxuesong', '老七': 'laoqi', '董海伟': 'donghaiwei', '尔东': 'erdong', '狗叽': 'gouji',
    '安科': 'anke', '李智飞': 'lizhifei', '雷婷': 'leiting', '张勇超': 'zhangyongchao', '任全欣': 'renquanxin',
    '李一鸣': 'liyiming', '李丁': 'liding', '贾晓艳': 'jiaxiaoyan', '闫汉': 'yanhan', '张敬恒': 'zhangjingheng',
    '黄国桐': 'huangguotong', '甲壳虫': 'jiakechong', '王卉彤': 'wanghuitong', '安妮': 'anni', '莲子': 'lianzi',
    '包子貘': 'baozimo', '李宏瀚': 'lihonghan', '孙伟楠': 'sunweinan', '心悦': 'xinyue', '杨磊': 'yanglei',
    '王舒瑶': 'wangshuyao', '崔寅达': 'cuiyinda', '橙子': 'chengzi', '张青': 'zhangqing', '支众韬': 'zhizhongtao',
    '杨艳': 'yangyan', '泡泡': 'paopao', '高子晶': 'gaozijing', '郎雪娇': 'langxuejiao', '卢强': 'luqiang',
    '张淼祥': 'zhangmiaoxiang', '腰果': 'yaoguo', '九安': 'jiuan', '何伟': 'hewei', '传生': 'chuansheng',
    '阿颂': 'asong', '石文辉': 'shiwenhui', '苏仕鑫': 'sushixin', '李欣彤': 'lixintong', '赵泓烨': 'zhaohongye',
    '郑洋': 'zhengyang', '荣波': 'rongbo', '宋旺': 'songwang', '刘鹏': 'liupeng', '刘璐': 'liulu',
    '吴君铭': 'wujunming', '桃子': 'taozi', '刘恒聚': 'liuhengju', '薛鹏鑫': 'xuepengxin', '李照鑫': 'lizhaoxin',
    '王志成': 'wangzhicheng', '钟佳': 'zhongjia', '李东华': 'lidonghua', '刘超': 'liuchao', '徐琛': 'xuchen',
    '李一康': 'liyikang', '张珂鸣': 'zhangkeming', '黎家鑫': 'lijiaxin', 'Link': 'link', '王煜程': 'wangyucheng',
    '李邦景': 'libangjing'
  }
  return pinyinMap[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
