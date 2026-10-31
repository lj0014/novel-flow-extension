# 阅流 NovelFlow

阅流是一款面向中文网页小说的 Chrome Manifest V3 沉浸阅读扩展。它会把当前章节整理成清爽阅读视图，支持护眼绿、纸张和深色主题、自动滚动、阅读进度、站点级自定义 CSS 选择器，以及下一页、下一章和无感连续阅读。

当前版本：**1.0.6**

![阅流阅读界面](docs/preview.png)

## 功能

- **沉浸阅读**：护眼绿、纸张和深色主题；可调字号、行距、正文宽度和自动滚动速度。
- **正文提取**：同时命中多个候选容器时，根据文字量、段落数、链接密度和可见性选择正文。
- **连续阅读**：自动加载下一页、下一章，并把同一章节的多个分页合并为一个标题。
- **循环保护**：相同 URL、自指链接、相同正文和连续重复请求都会停止，避免无限翻页。
- **动态页面**：支持异步正文、AJAX 分页、SPA 路由变化、同源重定向和最多约 4 秒的动态正文等待。
- **本地设置**：阅读进度、主题、排版和站点选择器保存在本机扩展存储中。
- **站点适配**：正文识别错误时，可按域名保存 `#content`、`#chaptercontent`、`.j_readContent` 等自定义选择器。
- **按需运行**：点击扩展图标后才访问当前标签页，不向所有网站常驻注入脚本。

## 安装

1. 从 [`dist/NovelFlow_1.0.6_Chrome.zip`](dist/NovelFlow_1.0.6_Chrome.zip) 下载安装包。
2. 解压 ZIP。
3. 在 Chrome 打开 `chrome://extensions/`，启用右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择解压后的 `novel-flow-extension` 文件夹。
5. 打开小说章节页，点击工具栏中的阅流图标。

从旧版升级时，建议继续使用同一个扩展目录：先退出旧阅读视图，用新版运行文件覆盖，再在扩展管理页点击“重新加载”。这样可以保留扩展 ID、本地设置和阅读进度。

也可以在本地直接加载本仓库根目录进行开发。

## 常见站点与模板

扩展针对以下公开站点和常见小说建站模板做了正文、分页及下一章适配：

- 起点、番茄、晋江、纵横、17K、书旗。
- 杰奇／BookText、PTCMS PC/WAP、YGBOOK、KYXSCMS／狂雨、WMCMS、MCCMS、novel-plus。
- 小浣熊小说 CMS PC/WAP、船说 CMS、YiDu Novel、EnovelCMS。
- 经典笔趣阁、旧快眼看书分页／Base64 正文、Booksky 快眼 TXT 转码模板。

“笔趣阁”和“快眼看书”名称下存在大量不同源码、镜像和改版页面。仓库覆盖经过夹具和公开部署页验证的常见 DOM；无法保证每一个镜像、每一本书以及每次站点改版始终可用。遇到改版时，可以在“站点适配”中填写当前网站的正文 CSS 选择器。

## 登录、付费与安全边界

扩展只读取原站已经返回、当前用户有权阅读的页面文字：

- 不绕过登录、VIP、购买、订阅、验证码、安全验证或限流。
- 不伪造没有可靠地址的下一章 URL。
- 不读取或修改 cookies，不上传正文、设置或阅读记录。
- 跨域章节请求继续受浏览器同源策略限制；扩展只允许当前站点来源及同源重定向。
- 跨域 iframe 中的正文不会被越权读取。
- 原站返回空正文、极短占位内容或登录购买面板时，扩展会停止并提供原站入口。

## 权限

`manifest.json` 只申请：

- `activeTab`：用户点击扩展后临时读取当前标签页。
- `scripting`：按需注入本地 `content.js`。
- `storage`：在本机保存设置和阅读位置。

扩展不声明全站常驻 `content_scripts` 或 `host_permissions`，不包含统计、广告、远程脚本或远程规则更新。

## 测试

1.0.6 在 Chrome **156.0.8078.76** 中完成：

- 源码目录：**35 项回归通过，0 失败**。
- 安装 ZIP 解压目录：**35 项回归通过，0 失败**。
- 7 个公开页面完成正文检查。
- 旧快眼、两个 Booksky 快眼镜像、两个笔趣阁和 WMCMS 完成真实续页或续章。

详细结果见 [TEST-RESULTS.md](TEST-RESULTS.md)，公开页原始结果和浏览器回归结果保存在 [`tests/`](tests/)。本版改动见 [OPTIMIZATION-NOTES.md](OPTIMIZATION-NOTES.md) 和 [CHANGELOG.md](CHANGELOG.md)。

## 本地验证与复测

运行静态结构检查不需要第三方依赖：

```sh
node scripts/validate-extension.mjs
```

完整浏览器回归需要 Node.js 20+、Playwright 和较新的 Chrome／Chromium：

```sh
npm install
npx playwright install chromium
CHROME_PATH=/path/to/chrome npm test
```

Windows PowerShell 示例：

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm test
```

公开部署页探测会访问外部小说镜像，可能受到网络、限流或站点改版影响：

```sh
npm run test:live
```

复测脚本使用隔离的临时浏览器配置，不读取个人日常 Chrome 资料。

## 项目结构

```text
.
├── manifest.json             # MV3 清单
├── background.js             # 按需注入与同源章节请求
├── content.js                # 正文提取、阅读器与翻页逻辑
├── icons/                    # 扩展图标
├── dist/                     # 可安装 ZIP 与校验值
├── docs/                     # 预览图
├── scripts/validate-extension.mjs
└── tests/                    # 浏览器回归、公开站探测和原始结果
```

## 隐私

扩展的正文提取、排版和翻页都在浏览器本地完成。除请求用户当前正在阅读的同源章节外，不向第三方发送数据。更多说明见 [SECURITY.md](SECURITY.md)。

## 许可证

本仓库暂未声明开源许可证。如需允许他人复制、修改或再分发，应在上传后补充明确许可证。
