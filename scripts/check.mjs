import assert from "node:assert/strict";
import urls from "../urls.json" with { type: "json" };
import worker from "../src/index.js";

assert.ok(Array.isArray(urls) && urls.length > 0, "urls.json 必须是非空数组");
for (const entry of urls) {
  assert.equal(typeof entry, "string", "每个网址必须是字符串");
  const url = new URL(entry);
  assert.ok(["http:", "https:"].includes(url.protocol), "只允许 HTTP/HTTPS 网址");
  assert.ok(!url.username && !url.password, "网址不能包含用户名或密码");
  assert.ok(!/[\r\n]/.test(entry), "网址不能包含换行符");
}
for (let i = 0; i < 30; i++) {
  const response = await worker.fetch(new Request("https://example.test/"));
  assert.equal(response.status, 302);
  assert.ok(urls.includes(response.headers.get("Location")));
  assert.equal(response.headers.get("Cache-Control"), "no-store");
}
console.log(`检查通过：${urls.length} 个网址，302 跳转正常。`);
