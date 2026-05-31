# 星途地球 - 全球景点全景探索平台

一个3D地球全景景点探索平台，支持3D地球漫游、景点信息查看、360°全景体验等功能。

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **3D渲染**: Three.js
- **全景展示**: Pannellum
- **UI组件**: Element Plus
- **样式**: Tailwind CSS

## 功能特性

### 🌍 3D地球漫游
- 鼠标拖拽旋转地球
- 滚轮缩放视角
- 自动旋转动画
- 平滑过渡动画

### 📍 景点探索
- 全球景点标记点
- 按类型分类展示
- 搜索功能
- 收藏功能
- 浏览历史

### 📷 360°全景
- 沉浸式全景体验
- 拖拽旋转视角
- 滚轮缩放
- 自动旋转

### 📋 景点攻略
- 景点介绍
- 交通信息
- 美食住宿推荐
- 游玩路线
- 实用贴士

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 使用说明

1. **旋转地球**: 按住鼠标左键拖拽
2. **缩放视角**: 使用鼠标滚轮
3. **查看景点**: 双击地球表面的标记点
4. **搜索景点**: 在左侧搜索框输入景点名称
5. **进入全景**: 在右侧面板点击"进入360°全景"按钮
6. **收藏景点**: 点击心形图标收藏喜爱的景点

## 项目结构

```
.
├── src/
│   ├── components/      # Vue组件
│   │   ├── EarthCanvas.vue       # 3D地球组件
│   │   ├── LeftSidebar.vue       # 左侧侧边栏
│   │   ├── TopToolbar.vue        # 顶部工具栏
│   │   ├── RightPanel.vue        # 右侧详情面板
│   │   ├── PanoramaViewer.vue    # 全景查看器
│   │   └── BottomInfo.vue        # 底部信息栏
│   ├── data/            # 数据
│   │   └── attractions.ts        # 景点数据
│   ├── pages/           # 页面
│   │   └── EarthExplorer.vue     # 主页面
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   ├── router.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 后续扩展

- 添加更多景点数据
- 集成真实地图瓦片
- 添加用户系统
- 支持自定义路线规划
- 添加VR模式支持

## License

MIT
