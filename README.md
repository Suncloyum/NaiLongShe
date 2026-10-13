# 奶龙社随机跳转

访问域名时，Cloudflare Worker 从 `urls.json` 中等概率随机选择一个网址，并返回不缓存的 302 跳转。修改 main 分支上的文件后，GitHub Actions 自动检查和部署；部署失败时保留此前生效的版本。

## 首次配置

1. 在 Cloudflare 账户中创建 API Token，使用 **Edit Cloudflare Workers** 模板。至少保留目标账户的 **Account / Workers Scripts / Edit** 权限。本项目通过控制台手动绑定路由，不需要在仓库保存区域写入权限。
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加：
   - `CLOUDFLARE_API_TOKEN`：上一步的令牌。
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID，可在账户/域名概览中找到；不要填 Zone ID。
3. 在仓库 **Actions → Check and deploy Worker → Run workflow** 手动运行一次。部署成功后，在 Cloudflare **Workers 和 Pages** 中找到 `nailongshe-random-redirect`。
4. 在 Worker **设置 → 域和路由 → 添加 → 路由** 中选择 `奶龙社.com` 所在区域，添加 `奶龙社.com/*` 和 `www.奶龙社.com/*`。如果输入框要求 ASCII，用下面的 Punycode 路由。
   - ASCII 根域名路由：`xn--yuso35evj0a.com/*`
   - ASCII www 路由：`www.xn--yuso35evj0a.com/*`
5. 保留域名的 A 记录 `@ → 192.0.2.1` 和 CNAME `www → 奶龙社.com`，两条都开启橙色云朵代理。确认阿里云 nameserver 已改为 Cloudflare，域名已激活、边缘证书已生效。
6. 停用之前固定跳转到 naosi.org 的重定向规则，再测试 HTTP、HTTPS、根域名和 www。

路由由控制台维护，`wrangler.jsonc` 不声明 routes。不要同时将这些域名添加为 Worker 自定义域名；本说明使用现有 DNS 的 Worker 路由方式。

## 日常添加网址

在 GitHub 打开 `urls.json`，点击编辑，修改后提交到 main：

```json
[
  "https://naosi.org",
  "https://example.com"
]
```

只保留你实际想访问的地址，不要将示例网址加入正式列表。最后一项不能带逗号，列表不能为空。提交后到 Actions 查看部署是否成功，通常几十秒到几分钟生效。

每次访问独立随机，可能连续命中同一网址；所有来源路径都跳转到列表中的完整网址，不附加来源路径或查询参数。列表只有一个地址时，总是跳到该地址。

## 本地检查

需要 Node.js 22 或以上版本：

```sh
npm ci
npm run check
npx wrangler deploy --dry-run
```

Cloudflare Token 只存 GitHub Secrets，不要提交到仓库，也不要发到聊天中。
