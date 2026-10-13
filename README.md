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
