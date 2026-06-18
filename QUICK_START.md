# 快速开始指南 (Quick Start)

## 📌 3分钟快速上手

### 第1步：转换数据 (Convert Data)
```
1. 打开 converter.html
2. 上传 中国一级至三级行政区划列表.xlsx
3. 点击 "转换为 JSON"
4. 点击 "下载 JSON" → 保存到项目文件夹
```

### 第2步：导出地图 (Export Map)
```
1. 在 Illustrator 中打开 中国一级至三级行政区划地图.ai
2. 为每个地区的路径添加 id (如: beijing, shanghai)
3. 文件 → 导出为 → SVG 格式
4. 保存为 china-map.svg 到项目文件夹
```

### 第3步：打开应用 (Open App)
```
1. 双击 index.html
2. 在浏览器中打开
3. 开始点击地图记录访问！
```

---

## 📁 文件检查清单

项目文件夹应该包含以下文件：

```
✓ index.html              - 主应用
✓ styles.css             - 样式
✓ data.js                - 数据管理
✓ map.js                 - 地图逻辑
✓ converter.html         - 转换工具
✓ china-regions-data.js  - 区域数据 (从 converter 下载)
✓ china-map.svg          - 地图文件 (从 Illustrator 导出)
```

---

## 🔍 问题排查

| 问题 | 解决方案 |
|------|--------|
| 地图不显示 | 检查 china-map.svg 是否在项目文件夹中 |
| 点击无反应 | 打开 F12 检查控制台是否有错误 |
| 数据丢失 | 从浏览器本地存储恢复（或重新导入） |
| SVG 过大 | 使用 SVGO 优化工具压缩 |

---

## 💾 数据备份

```
定期导出记录：
1. 点击 "导出记录"
2. 保存 JSON 文件
3. 以后可以随时导入恢复
```

---

## 🎨 Illustrator SVG 导出设置

**重要：导出时使用这些设置**

- SVG 版本: SVG 1.1
- 样式: 内联样式 ✓
- 转换为路径: ✓
- 响应式 SVG: ☐

---

## 🌐 如果浏览器显示安全警告

使用本地服务器：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# 访问
http://localhost:8000
```

---

## 📞 完整文档

- **README.md** - 详细功能说明
- **SETUP.md** - 完整设置教程
- **example-china-map.svg** - SVG 示例文件

---

## ✨ 开始使用！

现在就打开 `index.html` 开始记录你的旅游足迹吧！

祝你旅途愉快 🗺️
