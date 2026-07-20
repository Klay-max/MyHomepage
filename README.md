# MyHomepage - 个性化浏览器主页

🚀 **你的专属浏览器主页** - 苹果风格的网站导航工具，支持拖拽排序、智能搜索、待办事项，让上网更高效。

## ✨ 功能特性

- 🍎 **苹果风格设计** - 大圆角、磨砂质感、精致排版
- 🔍 **智能搜索框** - 搜索收藏网站或直接输入网址访问
- 📁 **分类管理** - 自定义分类，拖拽排序网站
- ✅ **待办事项** - 内置 TODO 小组件，随身工具包
- 🎨 **高度自定义** - 图标大小、显示密度、背景样式随心调
- 💾 **本地存储** - 数据保存在浏览器，无需登录

## 🌐 在线访问

访问 https://klay-max.github.io/MyHomepage

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand（持久化存储）
- **拖拽**: @dnd-kit
- **图标**: Lucide React

## 📁 项目结构

```
MyHomepage/
├── src/
│   ├── components/       # React 组件
│   │   ├── SearchBox.tsx      # 搜索框
│   │   ├── WebsiteCard.tsx    # 网站卡片
│   │   ├── CategorySection.tsx # 分类区块
│   │   ├── TodoWidget.tsx     # 待办事项
│   │   ├── AddWebsiteModal.tsx # 添加网站弹窗
│   │   └── SettingsPanel.tsx  # 设置面板
│   ├── store/           # Zustand 状态管理
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 主应用
│   └── index.css        # 全局样式
├── index.html
├── vite.config.ts
└── package.json
```

## 📝 使用说明

### 添加网站
1. 点击右上角 **+** 按钮
2. 输入网站名称和网址
3. 选择或新建分类
4. 点击添加

### 拖拽排序
- 拖拽网站图标调整同一分类内的顺序
- 拖拽分类标题调整分类顺序

### 自定义设置
1. 点击右上角 **设置** 按钮
2. 调整图标大小、显示密度、背景样式
3. 开关搜索框和待办事项小组件

### 智能搜索
- 输入关键词搜索收藏的网站
- 输入完整网址直接访问（如 github.com）
- 支持回车快速打开第一个结果

## 🎨 自定义主题

在设置面板中可以调整：
- **图标大小**: 小 / 中 / 大
- **显示密度**: 紧凑 / 舒适 / 宽松
- **背景样式**: 渐变 / 纯白 / 浅灰
- **小组件**: 搜索框 / 待办事项

## 📄 许可证

MIT License

---

**作者**: Darwin An
