# Chrome Web Store Privacy practices 填写建议

隐私政策 URL（启用 GitHub Pages 后）：

`https://lj0014.github.io/novel-flow-extension/privacy.html`

## 数据分类

| Chrome 分类 | 是否处理 | 扩展内处理方式 | 是否离开设备 |
| --- | --- | --- | --- |
| Website content | 是 | 读取用户主动开启的当前章节及同源后续章节，用于本地正文提取和续页/续章 | 否 |
| Web history | 仅当前页面和同源后续页面 URL | 匹配站点规则、校验来源、防止循环并保存阅读位置 | 否 |
| User activity | 阅读设置和阅读进度 | 保存在 `chrome.storage.local` | 否 |
| Authentication information | 否 | 不读取账号或凭据，不直接读取、记录或修改 cookie | 否 |
| Personally identifiable information | 否 | 无账号系统 | 否 |
| Financial and payment information | 否 | 无支付或交易功能 | 否 |
| Health information | 否 | 无 | 否 |
| Personal communications | 否 | 无 | 否 |
| Location | 否 | 无 | 否 |

## 使用目的

- 在当前章节生成沉浸阅读界面。
- 识别并加载可靠的同源下一页/下一章。
- 保存用户选择的主题、排版、站点选择和阅读位置。
- 防止自指、重复地址、重复正文和请求循环。

## 披露说明

扩展会在设备本地读取网页正文，并在用户主动开启阅读器后请求当前网站内由页面链接指向的后续章节。正文不持久保存，不上传，不用于广告、画像、信用、贷款或保险。

扩展没有数据分析、广告、远程脚本或数据销售/共享。

## 有限使用声明

所有网页内容、当前网址、设置和阅读进度的使用，仅限实现扩展公开说明的沉浸阅读、连续翻页和本地进度功能。不会转让、出售或用于确定信用度或提供贷款，也不会用于与单一用途无关的目的。

## 审核备注

如果后台要求选择“website content”或“web history”，建议如实勾选并选择“仅本地处理、不传输”；如果界面将纯本地处理定义为“不收集”，应以后台当时的说明和最终披露要求为准。不要声称完全不读取网页内容，因为正文提取是扩展核心功能。
