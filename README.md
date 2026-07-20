# macOS Web Desktop

高完成度、可长期使用的网页版 macOS 桌面模拟系统。

## 功能特性

### 系统级功能
- ✅ 开机启动画面与进度条
- ✅ 锁屏/解锁界面
- ✅ 屏保系统（Canvas 粒子动画）
- ✅ 关机流程
- ✅ 浅色/深色/自动主题切换
- ✅ 响应式布局适配

### UI 组件
- ✅ 玻璃拟态菜单栏（Menu Bar）
- ✅ 玻璃拟态 Dock（支持自动隐藏、激活指示器）
- ✅ 控制中心（Control Center）
- ✅ 通知中心（Notification Center）
- ✅ Spotlight 搜索
- ✅ 右键上下文菜单

### 窗口管理器
- ✅ 多窗口支持（最多 20 个）
- ✅ 窗口聚焦（z-index 管理）
- ✅ 窗口拖动
- ✅ 八向缩放（N, S, W, E, NW, NE, SW, SE）
- ✅ 最小化/最大化/全屏
- ✅ 窗口恢复
- ✅ Dock 状态同步

### 应用程序
- ✅ **Finder** - 虚拟文件系统浏览器
- ✅ **Safari** - 浏览器（通过 iframe 模拟）
- ✅ **终端** - 命令行模拟器（支持 ls, cd, cat, mkdir, rm 等命令）
- ✅ **文本编辑** - 完整文本编辑器（支持保存、自动保存、字体设置）
- ✅ **备忘录** - 笔记应用（支持多笔记、自动保存）
- ✅ **日历** - 月历视图（支持添加事件）
- ✅ **照片** - 照片管理（支持导入）
- ✅ **系统设置** - 设置面板（通用、外观、Dock、壁纸、辅助功能、关于）

### 虚拟文件系统
- ✅ 持久化存储（LocalStorage）
- ✅ 文件夹/文件 CRUD 操作
- ✅ 默认目录结构（桌面、文稿、下载、图片、应用程序）

## 快速开始

### 直接运行
双击 `index.html` 即可在浏览器中运行。

### 静态服务器
```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

## 测试

### 安装依赖
```bash
npm install
npx playwright install
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npx playwright test --grep "Window Manager"

# UI 模式
npm run test:ui

# 调试模式
npm run test:debug

# 查看报告
npm run test:report
```

### 测试覆盖
- 启动与锁屏流程
- 桌面与菜单栏
- Dock 交互
- 窗口管理（打开、关闭、最小化、最大化、拖动、缩放）
- 所有应用程序功能
- TextEdit 文本编辑功能
- Spotlight 搜索
- 控制中心与通知中心
- 主题切换
- 虚拟文件系统
- 数据持久化
- 响应式布局
- 错误处理
- 键盘快捷键

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 玻璃拟态、动画、响应式
- **原生 JavaScript** - 无框架依赖
- **LocalStorage** - 数据持久化
- **Playwright** - E2E 测试

## 浏览器兼容性

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + Space` | 打开 Spotlight |
| `Cmd/Ctrl + W` | 关闭窗口 |
| `Cmd/Ctrl + M` | 最小化窗口 |
| `Cmd/Ctrl + N` | 新建窗口 |
| `Cmd/Ctrl + Tab` | 切换窗口 |
| `Escape` | 关闭菜单/面板 |

## 项目结构

```
macos-web-desktop/
├── index.html              # 主入口
├── css/
│   └── macos.css          # 完整样式系统
├── js/
│   ├── core/
│   │   └── system.js      # 核心系统（VFS、主题、窗口管理、启动等）
│   └── apps/
│       ├── finder.js      # Finder 应用
│       ├── safari.js      # Safari 浏览器
│       ├── terminal.js    # 终端模拟器
│       ├── textedit.js    # 文本编辑器
│       ├── notes.js       # 备忘录
│       ├── calendar.js    # 日历
│       ├── photos.js      # 照片
│       └── settings.js    # 系统设置
├── assets/
│   ├── icons/             # SVG 应用图标
│   └── wallpapers/        # SVG 壁纸
├── tests/
│   └── macos.spec.js      # Playwright 测试套件
├── playwright.config.js   # Playwright 配置
└── package.json           # 项目配置
```

## 许可证

MIT License
