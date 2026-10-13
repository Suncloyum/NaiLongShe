import assert from "node:assert/strict";
import entries from "../generated/communities.json" with {type:"json"};
import worker, {normalizeClubs} from "../src/index.js";
const clubs = normalizeClubs(entries);
const home = await worker.fetch(new Request("https://example.test/"));
assert.equal(home.status,200);
assert.match(home.headers.get("Content-Type"),/text\/html/);
const html = await home.text();
assert.match(html,/href="\/random\?q=.*?" target="_blank"/);
assert.equal((html.match(/class="club"/g)||[]).length,clubs.length);
for(let i=0;i<(clubs.length ? 30 : 0);i++){
 const r=await worker.fetch(new Request("https://example.test/random"));
 assert.equal(r.status,302);
 assert.ok(clubs.some(c=>(c.url || "/?group="+encodeURIComponent(c.qqNumber))===r.headers.get("Location")));
 assert.equal(r.headers.get("Cache-Control"),"no-store");
}
assert.equal((await worker.fetch(new Request("https://example.test/missing"))).status,404);
assert.equal((await worker.fetch(new Request("https://example.test/",{method:"POST"}))).status,405);
assert.equal(await (await worker.fetch(new Request("https://example.test/",{method:"HEAD"}))).text(),"");
assert.deepEqual(normalizeClubs([]),[]);
assert.throws(()=>normalizeClubs([{name:"test",url:"javascript:alert(1)"}]));
assert.throws(()=>normalizeClubs([{name:"",url:"https://example.com"}]));
assert.equal(normalizeClubs(["https://example.com"])[0].name,"example.com");
console.log("检查通过："+clubs.length+" 个社团，首页、随机跳转和数据校验正常。");

const {addClub} = await import("../src/add-club.js");
const post = (data) => new Request("https://example.test/clubs",{method:"POST",headers:{Origin:"https://example.test","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(data)});
assert.equal((await addClub(post({name:"测试名称",description:"社团",url:"https://example.com"}),{})).status,503);
assert.equal((await addClub(post({name:"测试名称",description:"社团",url:"javascript:alert(1)"}),{GITHUB_WRITE_TOKEN:"test"})).status,400);
const originalFetch = globalThis.fetch;
let written;
globalThis.fetch = async (url, options) => {
 if(url.includes("/git/ref/")) return Response.json({object:{sha:"base"}});
 if(url.includes("/contents/communities?")) return Response.json(entries.map((c,i)=>({name:i+".json",path:"communities/"+i+".json"})));
 if(url.includes("/contents/") && options.method === "GET") {const i=Number(url.match(/communities\/(\d+)/)[1]);return Response.json({content:Buffer.from(JSON.stringify(entries[i])).toString("base64")});}
 if(url.endsWith("/pulls")) {written=JSON.parse(options.body);return Response.json({number:123},{status:201});}
 return Response.json({});
};
try {
 assert.equal((await addClub(post({name:"测试名称",description:"简介",url:"https://example.com"}),{GITHUB_WRITE_TOKEN:"test"})).status,201);
 assert.equal(written.title,"[社群申请] 测试名称");
 assert.equal(written.base,"main");
 if(clubs.length) assert.equal((await addClub(post({name:"重复",url:clubs[0].url,type:clubs[0].type,qqNumber:clubs[0].qqNumber}),{GITHUB_WRITE_TOKEN:"test"})).status,409);
} finally {globalThis.fetch=originalFetch;}
assert.match(html,/name="description"/);
assert.match(html,/action="\/clubs" method="post"/);
console.log("社团提交、GitHub 保存及重复链接校验通过。");

const {filterClubs} = await import("../src/index.js");
const samples=normalizeClubs([{name:"校园群",url:"https://qm.qq.com/q/test",keywords:["Minecraft"],organization:"某大学",qqNumber:"123456",type:"group"},{name:"网站",url:"https://example.com",keywords:["绘画"]}]);
assert.equal(filterClubs(samples,"minecraft").length,1);
assert.equal(filterClubs(samples,"123456","group").length,1);
assert.equal(filterClubs(samples,"","site").length,1);
assert.equal(filterClubs(samples,"不存在").length,0);
assert.equal((await worker.fetch(new Request("https://example.test/random?q=definitely-no-result"))).status,404);
assert.match(html,/background-switch/);
console.log("关键词、类型筛选与随机访问空结果检查通过。");
