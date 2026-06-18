# 地图不显示 - 诊断和解决方案

## 🔍 第一步：检查浏览器控制台

### 1.1 打开开发者工具
- 按 **F12** 或 **Ctrl+Shift+I**（Windows）
- 或右键点击页面 → "检查"

### 1.2 检查 Console 标签
- 点击 "Console" 标签
- 查看是否有红色错误信息
- 记下所有错误信息

### 1.3 常见错误和含义

**错误 1：GET http://localhost:8000/china-map.svg 404 (Not Found)**
- 原因：`china-map.svg` 文件不在项目文件夹中
- 解决：确保文件存在，或使用 svg-editor.html 创建

**错误 2：Uncaught ReferenceError: XLSX is not defined**
- 原因：converter.html 的 XLSX 库未加载
- 解决：刷新页面或检查网络连接

**错误 3：Uncaught TypeError: Cannot read property 'querySelectorAll' of null**
- 原因：SVG 文件加载失败或格式错误
- 解决：检查 SVG 文件内容

---

## 🔎 第二步：检查文件是否存在

在项目文件夹中应该有以下文件：

| 文件名 | 是否存在 | 大小 |
|--------|--------|------|
| index.html | ✓ | 5KB |
| styles.css | ✓ | 8KB |
| data.js | ✓ | 3KB |
| map.js | ✓ | 10KB |
| china-regions-data.js | ✓ | 50-100KB |
| **china-map.svg** | ❓ | 200KB-2MB |

### 2.1 检查 china-map.svg

1. **打开文件管理器**
   - 导航到 `MapOfChina` 文件夹
   
2. **查找 `china-map.svg`**
   - 该文件是否存在？
   - 文件名是否完全匹配（包括大小写）？
   - 文件大小是否合理（> 100KB）？

3. **如果文件不存在**
   - 需要从 Illustrator 导出（见下方步骤 3）
   - 或使用 svg-editor.html 创建

---

## 📤 第三步：导出 SVG 文件

### 3.1 如果还没有 SVG 文件

1. **打开 Adobe Illustrator**
   - 打开 `中国一级至三级行政区划地图.ai`

2. **导出为 SVG**
   - 文件 → 导出为
   - 快捷键：`Ctrl+Shift+E`
   - 文件名：`china-map`
   - 文件类型：`SVG (*.svg)`
   - 位置：`MapOfChina` 项目文件夹

3. **SVG 导出选项**
   - ☑️ 样式：内联样式
   - ☑️ 转换为路径
   - 其他保持默认

4. **点击导出**

### 3.2 验证导出的 SVG

1. **在浏览器中预览**
   - 在浏览器中打开 `china-map.svg`
   - 检查是否显示地图

2. **检查文件内容**
   - 用文本编辑器打开 `china-map.svg`
   - 应该看到 `<svg>` 标签
   - 应该看到多个 `<path>` 元素

---

## 🔌 第四步：检查 JavaScript 加载

### 4.1 在浏览器控制台测试

打开 index.html，按 F12，进入 Console 标签，输入以下命令检查：

```javascript
// 检查 china-regions-data 是否加载
console.log(window.chinaCities)
// 应该输出区域数据对象
```

**如果出现 `undefined`**
- 说明 `china-regions-data.js` 没有正确加载
- 检查文件是否存在
- 检查文件名是否完全匹配

```javascript
// 检查 mapData 是否初始化
console.log(window.mapData)
// 应该输出 MapData 对象
```

**如果出现 `undefined`**
- 说明 `data.js` 没有正确加载
- 刷新页面重试

```javascript
// 检查地图对象
console.log(window.chinaMap)
// 应该输出 ChinaMap 对象
```

**如果出现 `undefined`**
- 说明 `map.js` 没有正确加载或初始化失败
- 检查浏览器控制台中是否有错误

---

## 🛠️ 第五步：常见问题解决方案

### 问题 1：SVG 文件存在，但还是不显示

**可能原因**
- SVG 文件没有内容
- SVG 格式不正确
- SVG 文件被空格或特殊字符损坏

**解决方案**
```bash
# 检查 SVG 文件大小
# 应该 > 100KB，如果 < 10KB 可能是空文件

# 用文本编辑器打开检查
# 应该以 <svg 开头
# 应该以 </svg> 结尾
# 应该包含多个 <path> 标签
```

### 问题 2：SVG 显示但看起来很小或在角落里

**可能原因**
- SVG viewBox 属性不正确
- SVG 尺寸设置错误

**解决方案**
- 这通常不影响功能，只影响显示大小
- 可以通过修改 `styles.css` 中的尺寸来调整

### 问题 3：控制台显示 "地图还未加载" 信息

这说明：
1. SVG 文件加载失败（404）
2. 或者 SVG 加载超时

**解决方案**
1. 检查 `china-map.svg` 是否在正确位置
2. 尝试使用本地服务器而不是直接打开文件

### 问题 4：使用本地服务器运行

如果遇到 CORS 错误或文件无法加载：

```bash
# Windows PowerShell
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 然后在浏览器中访问
http://localhost:8000
```

---

## 📋 完整诊断清单

按顺序检查以下事项：

1. **文件存在检查**
   - [ ] `index.html` 存在
   - [ ] `styles.css` 存在
   - [ ] `data.js` 存在
   - [ ] `map.js` 存在
   - [ ] `china-regions-data.js` 存在
   - [ ] **`china-map.svg` 存在** ← 最重要！

2. **浏览器检查**
   - [ ] 打开 F12 Console
   - [ ] 没有红色错误信息
   - [ ] Network 标签中 `china-map.svg` 状态是 200（成功）

3. **JavaScript 检查**
   - [ ] `console.log(window.chinaCities)` 输出数据
   - [ ] `console.log(window.mapData)` 输出对象
   - [ ] `console.log(window.chinaMap)` 输出对象

4. **SVG 检查**
   - [ ] `china-map.svg` 大小 > 100KB
   - [ ] 用浏览器直接打开 `china-map.svg` 能看到地图
   - [ ] SVG 包含 `<svg>` 标签和 `<path>` 元素

5. **最终检查**
   - [ ] 地图显示在页面中
   - [ ] 可以点击地区
   - [ ] 点击后有视觉反馈（颜色改变）

---

## 📞 快速故障排除步骤

如果地图还是不显示，按以下顺序尝试：

### 步骤 A：最可能的原因 - SVG 文件丢失

```bash
# 1. 检查项目文件夹
# 是否有 china-map.svg？
# 如果没有，需要从 Illustrator 导出

# 2. 如果 Illustrator 导出了但找不到
# 检查文件是否在下载文件夹
# 需要将其移动到 MapOfChina 文件夹
```

### 步骤 B：SVG 文件存在但格式问题

```bash
# 1. 用文本编辑器打开 china-map.svg
# 2. 检查是否以 <svg 开头
# 3. 如果文件太小（< 10KB），说明导出失败
# 4. 重新在 Illustrator 中导出
```

### 步骤 C：数据文件问题

```bash
# 1. 检查是否运行过 converter.html
# 2. 是否下载并保存了 china-regions-data.js
# 3. 文件是否在项目文件夹中
```

### 步骤 D：使用本地服务器

```bash
# 1. 在项目文件夹中打开 PowerShell
# 2. 输入命令：python -m http.server 8000
# 3. 在浏览器中访问：http://localhost:8000
```

---

## ✅ 应该看到的

正常情况下，打开 index.html 后应该看到：

```
┌─────────────────────────────────────────────┐
│  中国地图 - 旅游记录                          │
│  已访问省份：0  已访问城市：0  已访问县级：0  │
├──────────────────────┬──────────────────────┤
│                      │  控制面板             │
│                      │  [清除所有记录]        │
│                      │  [导出记录]           │
│      地图显示        │  [导入记录]           │
│      区域可点击      │                      │
│                      │  筛选                 │
│                      │  □ 按省份显示         │
│                      │  □ 按城市显示         │
│                      │  □ 按县级显示         │
│                      │                      │
│                      │  详细信息             │
│                      │  点击地区查看...      │
│                      │                      │
│                      │  已访问列表           │
│                      │  暂无记录             │
└──────────────────────┴──────────────────────┘
```

---

## 🆘 如果还是不行

请按以下格式提供信息：

1. **F12 Console 中的错误信息**（完整复制）
2. **Network 标签中 china-map.svg 的状态**（200、404 等）
3. **项目文件夹中的文件列表**
4. **china-map.svg 文件大小**
5. **您使用的浏览器和版本**

---

**这个诊断指南应该能帮你找到问题所在！** 🔧
