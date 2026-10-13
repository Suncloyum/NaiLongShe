# 奶龙社 · 奶龙社群传送门

访问 https://奶龙社.com 浏览网站和 QQ 社群，搜索与随机发现同好。运行在 Cloudflare Workers，通过 GitHub Actions 部署。

## 页面功能

- 社群按随机顺序展示；匹配结果不超过 3 个时静态展示，每项只出现一次，超过 3 个时自动循环滚动，悬停或键盘聚焦暂停。
- 按名称、简介、学校/单位、搜索关键词、群号和链接搜索，支持网站/QQ群聊筛选。搜索只更新列表、数量和随机按钮，不刷新整页。
- 卡片展示名称、简介、关键词；右侧网站显示完整链接，群聊显示 QQ 群号。
- 随机网站、随机群聊、随机访问全部三个按钮，在新标签页打开目标。随机访问保留当前搜索词，三个按钮分别选择对应类型。
- 左下角可切换背景；壁纸来自 Nailong-Studio/wallpaper 的 classic 目录。
- 系统启用减少动态效果时，使用手动滚动。

## 信息存放在哪里

**已收录的全部社群保存在仓库根目录 main 分支的 urls.json。** 当前尚未改成每个社群一个文件的目录，也没有数据库。

| 位置 | 内容 |
| --- | --- |
| main 分支的 urls.json | 已审核、参与线上展示与随机访问的社群 |
| applications/<随机ID> 分支的 urls.json | 尚待审核申请所提议的完整列表 |
| 仓库 Pull Requests | 申请的资料说明、文件差异和审核记录 |
| backgrounds.json | 随机背景图片路径列表 |
| public/images/classic/ | 38 张背景图片 |
| public/images/nailong-icon.png | 网站奶龙头像 |
| Cloudflare Worker Secret | GitHub 访问令牌 GITHUB_WRITE_TOKEN |
| GitHub Actions Secrets | Cloudflare 部署令牌和账户 ID |

线上使用最近一次成功部署时打包的数据。main 文件变化后需要自动部署成功，网页才更新；不会每次访问都读取 GitHub。

## 社群数据格式

urls.json 是非空 JSON 数组，一项对应一个社群：

```json
[
  {
    "name": "示例社群",
    "description": "这里填写社群简介",
    "url": "https://example.com",
    "organization": "示例学校",
    "qqNumber": "",
    "keywords": ["奶龙", "游戏", "校园"],
    "type": "site"
  }
]
```

| 字段 | 含义 | 要求 |
| --- | --- | --- |
| name | 社群名称 | 必填，申请时最多 80 字 |
| url | 网站或加群邀请链接 | 必填，HTTP/HTTPS，最多 2048 字 |
| description | 社群简介 | 选填，最多 120 字 |
| organization | 学校/单位 | 选填，最多 32 字 |
| qqNumber | QQ 群号 | 选填，填写时须为 5–11 位数字 |
| keywords | 搜索关键词 | 数据中为字符串数组；表单用中英文逗号分隔，最多 128 字 |
| type | 社群类型 | site 表示网站，group 表示 QQ 群聊；缺省为 site |

旧的仅有 name/url 或字符串网址的条目兼容；没有填写简介的条目不会凭空生成简介。QQ群号用于展示和搜索，加群仍需要官方 HTTP/HTTPS 邀请链接。QQ 分享文本可自动提取其中的群链接。

修改条目直接编辑相应对象，删除条目移除该对象，新增条目添加对象。中间项用逗号分隔，最后一项不能带逗号。

## 网页提交与 PR 审核

1. 访客展开“添加社群”，填写名称、链接及可选资料。
2. Worker 校验输入和已收录的重复链接，读取 main 分支最新列表。
3. Worker 从 main 创建 applications/<随机ID> 分支，仅在该分支的 urls.json 追加记录。
4. 创建向 main 的 Pull Request，包含资料和文件差异。**此时不修改 main，社群不会上线。**
5. 管理员在 Pull Requests 中审核。通过则合并 PR；拒绝则关闭 PR。
6. 合并触发 GitHub Actions，检查成功后自动部署，新增社群进入展示与随机访问。

多份申请修改同一个文件时可能产生合并冲突，审核者需要处理冲突、保留已合并的记录。合并后的申请分支可以删除。

当前申请通过 PR 审核，之前的 Issue 提交流程已停用。PR 检查只验证，不部署；部署只在 main 推送或手动运行时执行。

## 配置令牌与部署

### Cloudflare Worker 的 GitHub Secret

创建仅授权 Suncloyum/NaiLongShe 仓库的 Fine-grained personal access token，赋予：

- Contents: Read and write
- Pull requests: Read and write

保存至 Cloudflare → Workers 和 Pages → nailongshe-random-redirect → 设置 → 变量和机密，名称 GITHUB_WRITE_TOKEN，类型 Secret。它用于创建申请分支、提交数据文件、创建 PR。Issues 权限不是当前流程所需权限。不要将令牌提交到文件；过期后需更新。

### GitHub Actions 的 Cloudflare Secrets

在仓库 Settings → Secrets and variables → Actions 配置：

- CLOUDFLARE_API_TOKEN：Cloudflare 目标账户的 Workers Scripts Edit 权限。
- CLOUDFLARE_ACCOUNT_ID：Cloudflare 账户 ID，非 Zone ID。

Cloudflare 账户需要注册 workers.dev 子域名。Worker 名称为 nailongshe-random-redirect，保留域名路由：

```text
xn--yuso35evj0a.com/*
www.xn--yuso35evj0a.com/*
```

域名 DNS 开启橙色云朵代理，旧的固定重定向规则需停用。静态图片和 public/app.js 随 Worker 一起部署。

## 提交失败排查

错误页面会给出原因、错误编号和处理建议：

- SOURCE_INVALID：浏览器来源校验失败，按页面详情排查。
- FORM_INVALID / FORM_TOO_LARGE：输入格式、长度不符合要求。
- ALREADY_LISTED：链接已经收录。
- TOKEN_NOT_CONFIGURED：Worker 未配置 GitHub Secret。
- GITHUB_HTTP_401：令牌失效或过期。
- GITHUB_HTTP_403 / GITHUB_HTTP_404：检查目标仓库授权、Contents 和 Pull requests 写入权限。
- GITHUB_NETWORK_ERROR：连接 GitHub 异常，可稍后重试。

申请不会自动合并。可在仓库 Actions 查看检查及部署结果。

## 本地开发

需要 Node.js 22 或以上：

```sh
npm ci
npm run check
npx wrangler dev
npx wrangler deploy --dry-run
```

## 参考与图片来源

目录布局和提交字段参考 https://github.com/TomyJan/NaiList，在本项目 Worker 中实现。未接入该项目的登录、数据库及二维码解析功能。

背景来自 https://github.com/Nailong-Studio/wallpaper/tree/main/classic，头像和其他图片来源见 public/images/SOURCES.txt。
