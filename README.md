# MBTI Vibe

一个用于管理朋友 MBTI (Myers-Briggs) 人格类型信息的单页 React 应用。

![MBTI Vibe](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC)

## ✨ 功能特性

### 核心功能
- **好友管理**: 添加、编辑、删除好友信息
- **MBTI 分类**: 支持 16 种 MBTI 人格类型
- **多标签分组**: 每个好友可添加多个自定义分组标签
- **数据可视化**: MBTI 类型分布统计图表
- **数据备份**: 支持导出/导入 JSON 数据

### 人格信息系统
- **详细人格说明**: 点击 MBTI 类型可查看完整的人格描述
- **视觉化头像**: 为每种 MBTI 类型配备专属 SVG 头像
- **颜色分组**: 根据四大人格组（分析家、外交家、守护者、探险家）进行颜色区分
- **性别差异**: 不同性别显示不同深浅的颜色渐变

### 高级功能
- **智能搜索**: 支持按名字、MBTI、籍贯、学历搜索
- **多维度排序**: 支持按添加时间、年龄排序
- **自动计算**: 根据出生日期自动计算年龄
- **本地存储**: 数据自动保存到浏览器 localStorage

## 🎨 人格分组与配色

| 分组 | MBTI 类型 | 主色调 |
|------|-----------|--------|
| 🔮 分析家 | INTJ, INTP, ENTJ, ENTP | 紫色 |
| 🌿 外交家 | INFJ, INFP, ENFJ, ENFP | 绿色 |
| 🛡️ 守护者 | ISTJ, ISFJ, ESTJ, ESFJ | 蓝色 |
| 🎭 探险家 | ISTP, ISFP, ESTP, ESFP | 黄色 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行

```bash
# 进入项目目录
cd mbti-vibe

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`

## 📁 项目结构

```
mbti-vibe/
├── public/
│   └── assets/
│       └── avatars/          # MBTI SVG 头像资源
├── src/
│   ├── components/
│   │   ├── UserCard.jsx      # 好友卡片组件
│   │   ├── FriendFormModal.jsx  # 添加/编辑表单
│   │   ├── GroupTabs.jsx     # 分组标签导航
│   │   ├── StatsView.jsx     # 统计图表
│   │   ├── SearchBar.jsx     # 搜索与排序
│   │   ├── DataManagement.jsx # 数据导入导出
│   │   └── WikiModal.jsx     # MBTI 详细说明弹窗
│   ├── constants.js          # 常量定义（MBTI 映射等）
│   ├── App.jsx               # 主应用组件
│   ├── main.jsx              # 应用入口
│   └── index.css             # 全局样式
├── mbti_desc/                # MBTI 人格描述文档
├── package.json
└── vite.config.js
```

## 💾 数据结构

好友对象结构：

```typescript
{
  id: string;              // 唯一标识
  name: string;            // 姓名
  gender: '男' | '女';     // 性别
  mbti: string;            // MBTI 类型（如 'INTJ'）
  birthDate: string;       // 出生日期（ISO 格式）
  age: number;             // 年龄（自动计算）
  nationality: string;     // 国籍
  province: string;        // 省份
  education: string;       // 学历
  groups: string[];        // 分组标签数组
  tags: string[];          // MBTI 标签（自动生成）
  createdAt: number;       // 创建时间戳
}
```

## 🎯 使用指南

### 添加好友
1. 点击右上角 "添加好友" 按钮
2. 填写基本信息（姓名、性别、MBTI 类型等）
3. 点击 MBTI 头像网格选择人格类型
4. 可选：添加分组标签
5. 点击 "添加" 保存

### 查看人格详情
- 点击好友卡片上的 MBTI 类型（如 "INTJ"）即可查看详细的人格说明

### 管理分组
- 在添加/编辑好友时，可以输入自定义分组名称
- 点击 "推荐标签" 快速添加已有分组
- 支持为每个好友添加多个分组

### 数据备份
- 点击右上角 "导出数据" 按钮导出 JSON 文件
- 点击 "导入数据" 按钮恢复之前的备份

## 🔧 技术栈

- **React 19.2.0**: 函数式组件 + Hooks
- **Vite 7.2.4**: 构建工具与开发服务器
- **Tailwind CSS 4.1.18**: 实用优先的 CSS 框架
- **Recharts 3.7.0**: 数据可视化图表库
- **Lucide React**: 现代化图标库
- **ESLint**: 代码质量检查

## 📝 开发说明

### 代码风格
- 使用函数式组件（无类组件）
- React Hooks 管理状态和副作用
- useMemo 优化计算性能
- 中文 UI 和注释

### 状态管理
- 采用集中式状态管理，所有状态在 `App.jsx` 中管理
- 使用 localStorage 自动持久化数据
- 无全局状态管理库，保持轻量

### 数据流
```
App.jsx (单一数据源)
  ├── GroupTabs (分组过滤)
  ├── SearchBar (搜索与排序)
  ├── StatsView (统计展示)
  ├── UserCard[] (好友卡片)
  └── FriendFormModal (添加/编辑)
```

## 🎨 MBTI 人格系统

### 16 种人格类型

**分析家 (🔮 紫色)**
- **INTJ** - 建筑师：战略性、独立、预言家
- **INTP** - 逻辑学家：好奇、分析、拖延症晚期
- **ENTJ** - 指挥官：果断、领导、效率机器
- **ENTP** - 辩论家：创新、挑战、抬杠冠军

**外交家 (🌿 绿色)**
- **INFJ** - 提倡者：理想主义、深刻、DOOR SLAM
- **INFP** - 调停者：和谐、创意、精神内耗
- **ENFJ** - 主人公：魅力、利他、读心术
- **ENFP** - 竞选者：热情、自由、人类金毛

**守护者 (🛡️ 蓝色)**
- **ISTJ** - 物流师：负责、务实、Excel 狂魔
- **ISFJ** - 守卫者：支持、可靠、讨好型人格
- **ESTJ** - 总经理：高效、组织、KPI 狂魔
- **ESFJ** - 执政官：关怀、合作、八卦中心

**探险家 (🎭 黄色)**
- **ISTP** - 鉴赏家：灵活、动手、拆家办主任
- **ISFP** - 探险家：艺术、敏感、颜值即正义
- **ESTP** - 企业家：活力、冒险、反矫情达人
- **ESFP** - 表演者：娱乐、自发、C 位癌

## 📸 截图

![应用界面](https://via.placeholder.com/800x600?text=MBTI+Vibe+Interface)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

Created with ❤️ by [Your Name]

---

**享受探索人格类型的乐趣！** ✨
