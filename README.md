# Art PM v1.0 - 游戏美术项目管理工作台

基于 PRD v1.1 的一次性完整交付版本。

## 🚀 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **部署**: Vercel

## 📦 功能模块

### 已完成模块

- ✅ **Dashboard** - 项目概览、待办事项、交付日历
- ✅ **项目管理** - 项目CRUD、10条预置管线、基础配置
- ✅ **任务管理** - 看板/列表视图、状态流转、优先级
- ✅ **里程碑** - 时间线视图、状态跟踪
- ✅ **资产总表** - 资产追踪、跨管线进度、矩阵视图
- ✅ **人力资源** - 人员管理、部门、技能标签
- ✅ **外包管理** - 供应商管理、订单跟踪、付款节点
- ✅ **风险管理** - 风险矩阵、概率-影响评估
- ✅ **交付日历** - 月历视图、里程碑+任务到期
- ✅ **数据报表** - 项目统计、管线进度、成本分析

### 核心数据模型

- User / Role - 用户与权限
- Project / Pipeline - 项目与管线
- Task / Milestone - 任务与里程碑
- WorkPackage / Release - 工作包与版本规划
- Asset / AssetStage - 资产与资产阶段
- Person / Department / Studio - 组织架构
- OutsourceVendor / OutsourceOrder - 外包管理
- Risk - 风险登记
- Cost - 成本记录
- Workflow / WorkflowNode / WorkflowEdge - 工作流引擎

## 🛠 开发命令

```bash
# 安装依赖
npm install

# 数据库迁移
npx prisma migrate dev

# 初始化数据
POST /api/init

# 开发服务器
npm run dev

# 生产构建
npm run build
```

## 🔧 环境变量

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## 📝 API 列表

### 系统
- `POST /api/init` - 初始化数据库

### 项目
- `GET /api/projects` - 项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 项目详情
- `PATCH /api/projects/:id` - 更新项目

### 任务
- `GET /api/tasks` - 任务列表
- `POST /api/tasks` - 创建任务
- `PATCH /api/tasks/:id` - 更新任务

### 管线
- `GET /api/pipelines` - 管线列表

### 里程碑
- `GET /api/milestones` - 里程碑列表
- `POST /api/milestones` - 创建里程碑

### 资产
- `GET /api/assets` - 资产列表
- `POST /api/assets` - 创建资产

### 外包
- `GET /api/outsource/vendors` - 供应商列表
- `GET /api/outsource/orders` - 订单列表

### 风险
- `GET /api/risks` - 风险列表
- `POST /api/risks` - 创建风险

### 报表
- `GET /api/reports` - 报表数据
- `GET /api/dashboard` - Dashboard数据

## 🎯 预置管线 (10条)

1. 角色原画 (CHAR_CONCEPT)
2. 角色模型 (CHAR_MODEL)
3. 动作 (ANIMATION)
4. 地编 (LEVEL_DESIGN)
5. 特效 (VFX)
6. UI (UI)
7. 场景原画 (SCENE_CONCEPT)
8. 场景模型 (SCENE_MODEL)
9. 音频 (AUDIO)
10. 剧情 (NARRATIVE)

## 📄 许可证

MIT
