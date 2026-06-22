# 中国地图 - 旅游记录系统

一个交互式的中国地图应用，让你记录已访问过的省份、城市和县级行政区。

## 📋 项目文件说明

### 核心文件
- **index.html** - 主应用页面（打开此文件即可使用）
- **styles.css** - 样式表
- **data.js** - 数据管理和存储
- **map.js** - 地图交互逻辑

### 辅助文件
- **converter.html** - Excel 转 JSON 转换工具
- **china-regions-data.js** - 区域数据文件（需要生成）
- **china-map.svg** - 地图 SVG 文件（需要导出）

## 🚀 快速开始

### 第一步：准备区域数据

1. 打开 `converter.html` 文件（在浏览器中）
2. 上传您的 `中国一级至三级行政区划列表.xlsx` 文件
3. 点击 **"转换为 JSON"** 按钮
4. 检查生成的数据是否正确
5. 点击 **"下载 JSON"** 下载 `china-regions-data.js`
6. 将下载的文件放到项目文件夹中

### 第二步：准备地图文件

1. 用 **Adobe Illustrator** 打开 `中国一级至三级行政区划地图.ai`
2. 为每个地区的路径添加 `id` 属性（如：beijing, shanghai 等）
3. 使用菜单 **文件 → 导出为**
4. 选择 **SVG 格式**
5. 保存为 `china-map.svg` 到项目文件夹中
6. 在导出对话框中，建议勾选 **"保留裁切区域"** 和 **"转换为路径"**

### 第三步：启动应用

1. 在 HTML 编辑器或浏览器中打开 `index.html`
2. 或者直接在文件夹中双击 `index.html` 文件
3. 开始点击地图上的地区来记录你的旅游足迹！

## 🎯 功能特性

### 主要功能
- ✅ **点击地图** - 点击地区来标记为已访问
- 📊 **统计数据** - 实时显示已访问的省份、城市、县级数量
- 💾 **本地存储** - 自动保存数据到浏览器（不会丢失）
- 📥 **导入/导出** - 备份和恢复你的记录
- 🔍 **详细信息** - 鼠标悬停查看地区信息
- 🎨 **视觉反馈** - 已访问的地区会改变颜色

### 控制面板
- **清除所有记录** - 删除全部访问记录（谨慎使用！）
- **导出记录** - 保存当前记录为 JSON 文件
- **导入记录** - 从备份文件恢复记录

### 筛选选项
- **按省份显示** - 显示/隐藏省级区域
- **按城市显示** - 显示/隐藏城市级区域
- **按县级显示** - 显示/隐藏县级区域

### 侧边栏
- **已访问列表** - 查看所有已标记的地区
- **详细信息** - 显示选中地区的信息
- **实时更新** - 所有统计数据实时同步

## 📋 AI 文件导出指南

### Adobe Illustrator 导出 SVG 步骤

1. **打开文件**
   - 在 Illustrator 中打开 `中国一级至三级行政区划地图.ai`

2. **为地区添加 ID**
   - 选择每个地区的路径
   - 在属性面板中为路径添加 `id` 属性
   - 示例：`id="beijing"`, `id="shanghai"` 等

3. **导出为 SVG**
   - 菜单 → 文件 → 导出为
   - 或使用快捷键 `Ctrl+Shift+E` (Windows) / `Cmd+Shift+E` (Mac)
   - 选择文件格式：**SVG (*.svg)**
   - 文件名：`china-map.svg`
   - 保存位置：项目文件夹

4. **SVG 导出选项**
   - 样式：选择 **"内联样式"**
   - 字体：选择 **"转换为路径"**
   - 图像位置：**"嵌入"**
   - 响应式 SVG：可选
   - 点击 **"导出"** 或 **"确定"**

## 💾 数据存储

### 本地存储
- 所有访问记录存储在浏览器的 `localStorage` 中
- 数据格式：`{regionId}:{type}`
- 即使关闭浏览器，数据也会保留

### 导出格式
导出的 JSON 文件结构：
```json
{
  "version": "1.0",
  "exportDate": "2024-01-01T12:00:00Z",
  "stats": {
    "provinces": 5,
    "cities": 20,
    "counties": 100
  },
  "visitedRegions": [
    {
      "regionId": "beijing",
      "type": "province",
      "name": "北京"
    }
  ]
}
```

## 🎨 地图颜色说明

- **浅蓝色** - 未访问地区
- **深蓝色** - 已访问地区
- **紫蓝色（悬停）** - 鼠标悬停地区

## 🔧 自定义修改

### 修改颜色
编辑 `styles.css` 中的 SVG 样式部分：
```css
svg path { fill: #e8f4f8; }           /* 默认颜色 */
svg path.visited { fill: #667eea; }   /* 已访问颜色 */
```

### 修改统计项
在 `data.js` 中修改 `getStats()` 方法

### 添加新功能
在 `map.js` 中的 `ChinaMap` 类中添加新方法

## ⚠️ 注意事项

1. **浏览器兼容性** - 使用现代浏览器（Chrome、Firefox、Safari、Edge）
2. **数据安全** - 数据存储在本地浏览器，不会上传到任何服务器
3. **备份重要** - 定期导出记录以防浏览器数据丢失
4. **SVG 格式** - 确保导出的 SVG 文件中每个地区都有唯一的 `id`

## 🐛 常见问题

### Q: 地图不显示？
A: 检查是否将 `china-map.svg` 放在正确的文件夹中，确认文件名完全匹配。

### Q: 数据丢失了？
A: 数据存储在浏览器本地，清除浏览器缓存会导致数据丢失。请定期导出备份！

### Q: SVG 文件很大？
A: 这是正常的。可以使用在线 SVG 优化工具（如 SVGO）来压缩文件。

### Q: 如何编辑已访问的地区？
A: 在右侧"已访问列表"中点击任何地区，或直接在地图上再次点击地区来取消标记。

## 📞 技术说明

### 使用的技术
- HTML5
- CSS3（Flexbox、Grid）
- Vanilla JavaScript（不依赖 jQuery 或其他框架）
- LocalStorage API（数据持久化）
- SVG（矢量图形）

### 浏览器支持
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 文件大小参考

- index.html: ~5KB
- styles.css: ~8KB
- data.js: ~3KB
- map.js: ~10KB
- converter.html: ~12KB
- china-regions-data.js: 50-100KB（取决于数据量）
- china-map.svg: 200KB-1MB（取决于地图复杂度）

## 🎓 学习资源

- [MDN - SVG 教程](https://developer.mozilla.org/zh-CN/docs/Web/SVG)
- [MDN - LocalStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
- [Adobe Illustrator - SVG 导出](https://helpx.adobe.com/cn/illustrator/using/export-svg.html)

## 📝 更新日志

### v1.0
- 初始版本
- 基础地图交互
- 数据导入/导出
- 本地存储功能

## 🤝 贡献

如果有任何建议或发现 bug，欢迎反馈！

## 📌 数据来源与致谢

本项目使用的中国行政区划地图 SVG 文件来源于以下资源：

- **地图来源**：[中国行政区划矢量地图（知乎）](https://zhuanlan.zhihu.com/p/337915400)
- 感谢原作者提供高质量的中国省市县三级行政区划矢量地图数据。

> 如原作者有任何版权疑虑，请联系项目维护者予以处理。

---

**祝你旅途愉快！** 🌍
