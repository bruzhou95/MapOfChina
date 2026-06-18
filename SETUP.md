# 完整设置指南 - 中国地图旅游记录系统

## 📊 第一步：准备 Excel 数据

### 1.1 检查 Excel 文件格式

打开 `中国一级至三级行政区划列表.xlsx`，确保包含以下列之一：
- 方式 A：`省份`, `城市`, `县级`
- 方式 B：`省`, `市`, `县`
- 方式 C：`一级行政区`, `二级行政区`, `三级行政区`

### 1.2 转换 Excel 为 JSON

1. 在浏览器中打开 `converter.html`
2. 点击 "选择 Excel 文件" 按钮
3. 选择您的 `中国一级至三级行政区划列表.xlsx`
4. 等待文件加载（会显示数据预览）
5. 点击 "转换为 JSON" 按钮
6. 检查生成的 JSON 数据是否正确
7. 点击 "下载 JSON" 保存为 `china-regions-data.js`
8. 将下载的文件放到项目文件夹中

### 1.3 验证数据

打开 `index.html`，在浏览器控制台（F12）中输入：
```javascript
console.log(window.chinaCities)
```
应该能看到您的区域数据。

---

## 🗺️ 第二步：将 AI 文件转换为 SVG

### 2.1 在 Adobe Illustrator 中准备

1. **打开文件**
   - 启动 Adobe Illustrator
   - 打开 `中国一级至三级行政区划地图.ai`

2. **检查图层结构**
   - 打开"图层"面板（Window → Layers）
   - 确认有代表各省份的图层或路径
   - 记录主要地区的名称

3. **为每个地区添加 ID（重要！）**
   
   #### 方法 A：使用 SVG 属性面板
   - 选择一个地区的路径
   - 右键 → 编辑内容 → SVG 属性
   - 在 `id` 字段中输入标识符（如：beijing, shanghai, henan）
   - 确保 ID 是英文、数字或下划线，不包含空格
   - 对所有地区重复此操作
   
   #### 方法 B：在 SVG 输出后编辑
   - 先完成导出，然后用文本编辑器添加 ID
   - 详见下方 "2.4 手动编辑 SVG"

4. **整理图层**
   - 删除不需要的内容（如文字、标题等）
   - 保留只有地区路径的内容
   - 确保所有地区都可见

### 2.2 导出为 SVG（Windows 用户）

1. **打开导出对话框**
   - 点击菜单 → 文件 → 导出为...
   - 或使用快捷键 `Ctrl + Shift + E`

2. **设置文件选项**
   - 文件名：输入 `china-map`
   - 文件类型：选择 `SVG (*.svg)`
   - 位置：选择项目文件夹（MapOfChina 文件夹）
   - 点击 "导出"

3. **SVG 导出选项窗口**
   
   在弹出的 "SVG 选项" 对话框中：

   | 选项 | 推荐设置 |
   |-----|--------|
   | SVG 版本 | SVG 1.1 |
   | 类型 | 浮点型 |
   | 精度 | 3 |
   | 字体类型 | SVG |
   | 样式 | 内联样式 ✓ |
   | 小数点精度 | 3 |
   | 转换为路径 | ✓ |
   | 响应式 SVG | ☐（不勾选） |
   | 从 AI 保留 | ☐（不勾选） |

   - 点击 "导出" 或 "确定"

### 2.3 导出为 SVG（Mac 用户）

1. 菜单 → 文件 → 导出为...
2. 快捷键 `Cmd + Shift + E`
3. 其他步骤与 Windows 相同

### 2.4 手动编辑 SVG（如果没有提前添加 ID）

如果导出的 SVG 中的路径没有 ID，可以手动添加：

1. **用文本编辑器打开** `china-map.svg`
   - 推荐使用 VS Code 或 Sublime Text
   - 不要用 Word 或记事本

2. **找到路径元素**
   ```xml
   <path d="M 100,100 L 200,200..." fill="..." />
   ```

3. **添加 ID 属性**
   ```xml
   <path id="beijing" d="M 100,100 L 200,200..." fill="..." />
   ```

4. **为每个地区添加唯一 ID**
   - 北京：`id="beijing"`
   - 上海：`id="shanghai"`
   - 河南：`id="henan"`
   - 等等...

5. **保存文件**
   - 用 `Ctrl+S` 保存

### 2.5 验证 SVG 文件

1. 在浏览器中打开 `china-map.svg`
2. 检查是否显示完整地图
3. 右键 → 查看页面源代码
4. 搜索 `id="` 确认所有地区都有 ID
5. 记下这些 ID，需要在后面对应数据文件

---

## 🔗 第三步：链接数据与地图

### 3.1 更新 data.js（可选）

如果您想使用自定义的地区名称，需要更新 `data.js` 中的 `getRegionName` 方法：

```javascript
getRegionName(regionId) {
    const nameMap = {
        'beijing': '北京',
        'shanghai': '上海',
        'henan': '河南',
        // ... 添加所有地区
    };
    
    if (nameMap[regionId]) {
        return nameMap[regionId];
    }
    return this.regionsMetadata[regionId]?.name || regionId;
}
```

### 3.2 确保文件位置正确

项目文件夹结构应该是：
```
MapOfChina/
├── index.html                    (主应用)
├── styles.css                    (样式)
├── data.js                        (数据管理)
├── map.js                         (地图逻辑)
├── converter.html                (Excel转换工具)
├── china-map.svg                 (✓ 需要放这里)
├── china-regions-data.js         (✓ 需要放这里)
├── README.md                     (说明文档)
└── SETUP.md                      (本文档)
```

---

## 🚀 第四步：启动应用

### 4.1 打开应用

方式 A：直接打开文件
- 在文件管理器中找到 `MapOfChina` 文件夹
- 双击 `index.html` 文件
- 应该在浏览器中打开应用

方式 B：拖拽打开
- 将 `index.html` 拖拽到浏览器窗口中

方式 C：用 VS Code 打开
- 在 VS Code 中打开 `MapOfChina` 文件夹
- 右键点击 `index.html`
- 选择 "Open with Live Server"（需要安装 Live Server 扩展）

### 4.2 检查应用状态

打开后应该看到：
1. ✓ 标题：中国地图 - 旅游记录
2. ✓ 右侧有控制面板
3. ✓ 中间有地图显示区域
4. ✓ 统计数据显示（省份、城市、县级）

### 4.3 测试功能

1. **点击地图**
   - 点击任何地区
   - 地区应该改变颜色
   - 统计数据应该增加

2. **检查存储**
   - 刷新页面
   - 数据应该仍然存在（本地存储）

3. **导出数据**
   - 点击 "导出记录"
   - 应该下载一个 JSON 文件

4. **导入数据**
   - 点击 "导入记录"
   - 选择之前导出的 JSON 文件
   - 数据应该恢复

---

## 🐛 常见问题排查

### Q: 地图不显示

**原因 1：SVG 文件位置不对**
- 确认 `china-map.svg` 在项目文件夹中
- 检查文件名是否完全匹配（大小写敏感）

**原因 2：SVG 格式问题**
- 在 VS Code 中打开 `china-map.svg`
- 检查是否有 `<svg>` 标签
- 确认文件没有损坏

**解决方法：**
```bash
# 检查浏览器控制台（F12）是否有错误
# 看 Network 标签是否显示 404 错误
```

### Q: 点击地区没有反应

**原因：SVG 中的路径没有 ID**
- 打开 `china-map.svg`（用文本编辑器）
- 搜索 `<path` 标签
- 检查是否有 `id` 属性

**解决方法：**
```xml
<!-- 错误 -->
<path d="M 100,100 ..." fill="blue" />

<!-- 正确 -->
<path id="beijing" d="M 100,100 ..." fill="blue" />
```

### Q: 数据显示不完整

**原因 1：Excel 数据转换不完成**
- 再次运行 `converter.html`
- 检查输出数据是否有问题
- 重新下载 `china-regions-data.js`

**原因 2：数据文件位置不对**
- 确认 `china-regions-data.js` 在项目文件夹中
- 在浏览器控制台查看是否加载

**检查方法：**
```javascript
// 在浏览器控制台输入
console.log(window.chinaCities)
// 应该输出您的区域数据
```

### Q: 页面很卡/很慢

**可能原因：**
- SVG 文件过大
- 浏览器硬件加速未开启

**解决方法：**
1. 优化 SVG 文件（使用 SVGO）
2. 在浏览器设置中启用硬件加速
3. 关闭其他应用，释放内存

### Q: 浏览器显示安全警告

**原因：本地文件安全限制**

**解决方法：**
使用本地服务器代替直接打开文件：

```bash
# 如果安装了 Python 3
python -m http.server 8000

# 如果安装了 Python 2
python -m SimpleHTTPServer 8000

# 或使用 Node.js
npx http-server
```

然后访问 `http://localhost:8000`

---

## 📈 进阶配置

### 自定义样式

编辑 `styles.css`：

```css
/* 改变颜色主题 */
svg path { fill: #e8f4f8; }              /* 未访问 - 改为您喜欢的颜色 */
svg path.visited { fill: #667eea; }      /* 已访问 - 改为您喜欢的颜色 */

/* 改变边框 */
svg path { stroke: #999; stroke-width: 0.5; }

/* 改变悬停效果 */
svg path:hover { fill: #b3dfe8; }
```

### 添加自定义字段

在 `data.js` 中的 `MapData` 类添加新方法：

```javascript
class MapData {
    // ... 现有代码 ...
    
    addNote(regionId, note) {
        // 为地区添加备注
    }
    
    getNote(regionId) {
        // 获取地区备注
    }
}
```

### 集成到网站

将以下代码嵌入到您的网站中：

```html
<iframe src="path/to/index.html" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

---

## 📞 技术支持

### 获取更多帮助

1. 检查浏览器控制台（F12 → Console 标签）
2. 查看 Network 标签确认文件是否加载
3. 参考 README.md 文档

### 浏览器开发者工具

快捷键：`F12` 或 `Ctrl+Shift+I`

常用标签：
- **Console** - 查看错误和日志
- **Network** - 查看文件加载情况
- **Elements** - 查看 HTML 结构
- **Storage** - 查看本地数据

---

## ✅ 检查清单

在启动应用前，确认以下项目：

- [ ] `converter.html` 成功转换 Excel 文件
- [ ] `china-regions-data.js` 已下载并放在项目文件夹中
- [ ] `china-map.ai` 已在 Illustrator 中打开
- [ ] SVG 导出选项已正确配置
- [ ] `china-map.svg` 已导出并放在项目文件夹中
- [ ] SVG 文件中的路径都有 ID 属性
- [ ] `index.html` 可以在浏览器中打开
- [ ] 地图显示正常
- [ ] 点击地区可以标记为已访问
- [ ] 刷新页面后数据仍然存在

---

**祝贺！🎉 现在您应该可以开始使用中国地图旅游记录系统了！**
