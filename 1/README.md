# 手写数字识别系统

基于深度学习的手写数字识别Web应用程序。

## 功能特点

- 🎨 **绘制数字**：提供画布用于手写输入
- 🔍 **识别数字**：模拟深度学习模型进行识别
- 📊 **结果展示**：显示识别结果和置信度
- 📜 **识别历史**：保存最近10次识别记录
- 📱 **响应式设计**：支持移动端和桌面端

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite
- **开发语言**：JavaScript
- **测试工具**：Playwright

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 4. 运行测试

```bash
npx playwright test
```

## 项目结构

```
project-folder/
├─ dist/                  # 生产构建产物
├─ public/               # 静态资源
├─ src/                  # 源代码
│  ├─ components/        # React组件
│  ├─ styles/           # 样式文件
│  ├─ App.jsx           # 主应用组件
│  └─ main.jsx          # 应用入口
├─ tests/               # Playwright测试
├─ index.html           # HTML模板
├─ vite.config.js       # Vite配置
└─ package.json         # 项目配置
```

## 使用说明

1. 在左侧画布上用鼠标绘制数字
2. 点击"识别数字"按钮进行识别
3. 查看右侧的识别结果和置信度
4. 使用"清除画布"按钮清空画布
5. 识别历史记录显示在页面底部

## 注意事项

- 当前版本使用模拟数据进行识别
- 后续可集成真实的深度学习模型
- 支持MNIST数据集训练的模型

## License

MIT
