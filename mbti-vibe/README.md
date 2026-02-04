# MBTI Vibe

一个用于管理好友 MBTI（迈尔斯-布里格斯类型指标）人格类型的单页 React 应用。提供可视化的 MBTI 分布图表、好友分组管理、地理分布地图等功能。

## 功能特性

- **好友管理**: 添加、编辑、删除好友信息，支持 MBTI、年龄、性别、地理位置、教育背景等字段
- **分组系统**: 支持自定义分组和性别分组两种维度
- **数据可视化**:
  - MBTI 分布饼图
  - 地理分布地图视图
  - MBTI 兼容性关系网络图
- **搜索排序**: 支持按姓名、MBTI、地区、学历搜索，按添加时间或年龄排序
- **生日提醒**: 显示近期过生日的好友
- **置顶功能**: 可将重要好友置顶显示
- **数据导入导出**: 支持将好友数据导出为 JSON 文件，或从文件导入

## 技术栈

- **React 19.2.0** - 函数式组件 + Hooks
- **Vite 7.2.4** - 构建工具和开发服务器
- **Tailwind CSS 4.1.18** - 实用优先的 CSS 框架
- **Recharts 3.7.0** - 数据可视化图表库
- **Lucide React** - 图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
mbti-vibe/
├── src/
│   ├── components/          # React 组件
│   │   ├── UserCard.jsx          # 好友卡片
│   │   ├── FriendFormModal.jsx   # 添加/编辑好友模态框
│   │   ├── GroupTabs.jsx         # 分组导航标签
│   │   ├── StatsView.jsx         # 统计图表
│   │   ├── SearchBar.jsx         # 搜索排序栏
│   │   ├── BirthdayWidget.jsx    # 生日提醒组件
│   │   ├── MapView.jsx           # 地理分布地图
│   │   ├── RelationshipGraph.jsx # 关系网络图
│   │   └── DataManagement.jsx    # 数据导入导出
│   ├── App.jsx              # 主应用组件（状态管理）
│   ├── main.jsx             # 应用入口
│   ├── constants.js         # 常量配置（MBTI 标签等）
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── vite.config.js           # Vite 配置
├── tailwind.config.js       # Tailwind CSS 配置
└── postcss.config.js        # PostCSS 配置
```

## 数据存储

应用使用浏览器的 `localStorage` 进行本地数据持久化，无需后端服务器。数据会在每次修改后自动保存。

## MBTI 颜色编码

应用使用基于 MBTI 分组和性别的渐变色系统：

- **分析家** (INTx, ENTx) - 紫色系
- **外交家** (INFx, ENFx) - 绿色系
- **守护者** (ISTx, ESTx, ISFx, ESFx) - 蓝色系
- **探险家** (ISTP, ISFP, ESTP, ESFP) - 黄色系

性别不同会产生深浅不同的渐变效果。

## 开发说明

- 所有组件使用函数式组件和 Hooks
- 状态管理集中在 App.jsx，无需全局状态库
- 代码使用中文注释和 UI
- 头像使用 Emoji 而非图片

## License

MIT
