# 奶龙社 · 社团传送门

首页展示可滚动的社团列表，右侧按钮随机访问一个社团。名称链接与随机按钮均在新标签页打开。手机上随机按钮放在列表下方。

## 添加社团

编辑 urls.json，每项填写展示名称 name 和完整网址 url：

```json
[
  { "name": "脑丝", "url": "https://naosi.org" },
  { "name": "你的社团名称", "url": "https://example.com" }
]
```

中间项用逗号分隔，最后一项不加逗号。列表不能为空。提交到 main 后 Actions 自动检查、部署，失败时保留线上旧版本。现有社团展示名可自行改为官方名称。旧版字符串网址列表仍兼容。

首页 / 展示目录，/random 等概率独立选择社团并返回不缓存的 302 跳转，可能连续命中同一个社团。

现有 Cloudflare Secrets、Worker 名称、域名路由均保持不变，无需重新配置。域名 DNS 保持代理，停用之前固定跳转规则。

## 本地验证

Node.js 22 或以上：

```sh
npm ci
npm run check
npx wrangler deploy --dry-run
npx wrangler dev
```

## 网页添加社团

列表下方“添加社团”提供简介和链接两项输入。简介用作列表展示名称；提交只创建 GitHub Issue，等待管理员审核，不修改 urls.json。审核通过后管理员手动加入列表。

首次启用：在 GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens 创建仅限 NaiLongShe 仓库的令牌，权限为 Issues: Read and write（不需要 Contents 写权限）。将令牌保存到 Cloudflare Worker 设置 → 变量和机密，名称 GITHUB_WRITE_TOKEN，类型 Secret。不要将令牌写到代码或聊天中。

令牌到期后需更新。未配置令牌时提交会提示功能正在配置中。链接仅允许 HTTP/HTTPS，拒绝重复链接并重试并发提交冲突。该入口对访问者开放，提交内容仅进入仓库 Issue，未经审核不会展示在首页。

## 关键词和搜索

社群记录可添加 description、organization、qqNumber、keywords（字符串数组）、type（site 或 group）。首页可按名称、简介、学校/单位、关键词、群号和链接搜索，并按网站/QQ群聊筛选。滚动列表与随机访问共享筛选结果。

界面和提交字段参考 https://github.com/TomyJan/NaiList，自行实现于 Cloudflare Worker；保留 Issue 人工审核，不使用参考项目的 PostgreSQL、登录系统或直接入库流程。页面右下角标明参考项目与本站仓库。QQ群分享文本可提取 HTTPS 链接，暂不提供二维码图片识别。
