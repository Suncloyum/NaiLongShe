import assert from "node:assert/strict";
import entries from "../urls.json" with {type:"json"};
import worker, {normalizeClubs} from "../src/index.js";
const clubs = normalizeClubs(entries);
const home = await worker.fetch(new Request("https://example.test/"));
assert.equal(home.status,200);
assert.match(home.headers.get("Content-Type"),/text\/html/);
const html = await home.text();
assert.match(html,/href="\/random" target="_blank"/);
assert.equal((html.match(/class="club"/g)||[]).length,clubs.length);
for(let i=0;i<30;i++){
 const r=await worker.fetch(new Request("https://example.test/random"));
 assert.equal(r.status,302);
 assert.ok(clubs.some(c=>c.url===r.headers.get("Location")));
 assert.equal(r.headers.get("Cache-Control"),"no-store");
}
assert.equal((await worker.fetch(new Request("https://example.test/missing"))).status,404);
assert.equal((await worker.fetch(new Request("https://example.test/",{method:"POST"}))).status,405);
assert.equal(await (await worker.fetch(new Request("https://example.test/",{method:"HEAD"}))).text(),"");
assert.throws(()=>normalizeClubs([]));
assert.throws(()=>normalizeClubs([{name:"test",url:"javascript:alert(1)"}]));
assert.throws(()=>normalizeClubs([{name:"",url:"https://example.com"}]));
assert.equal(normalizeClubs(["https://example.com"])[0].name,"example.com");
console.log("检查通过："+clubs.length+" 个社团，首页、随机跳转和数据校验正常。");
