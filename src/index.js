import entries from "../urls.json" with { type: "json" };
export function normalizeClubs(entries) {
  if (!Array.isArray(entries) || !entries.length) throw new Error("urls.json 必须是非空数组");
  return entries.map((entry, i) => {
    const c = typeof entry === "string" ? {name:new URL(entry).hostname,url:entry} : entry;
    if (!c || typeof c.name !== "string" || !c.name.trim() || typeof c.url !== "string" || /[\r\n]/.test(c.url)) throw new Error("第 "+(i+1)+" 项需要有效 name 和 url");
    const u = new URL(c.url);
    if (!["http:","https:"].includes(u.protocol) || u.username || u.password) throw new Error("只允许不含账号密码的 HTTP/HTTPS 地址");
    return {name:c.name.trim(),url:u.href};
  });
}
const clubs = normalizeClubs(entries);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderPage() {
  const rows = clubs.map((c,i) => `<a class="club" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span class="number">${String(i+1).padStart(2,"0")}</span><span><strong>${esc(c.name)}</strong><small>${esc(new URL(c.url).hostname)}</small></span><span class="arrow" aria-hidden="true">↗</span></a>`).join("");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="奶龙社：浏览社团网站，随机发现下一站。"><title>奶龙社 · 社团传送门</title><style>
:root{color-scheme:light;--ink:#26352c;--muted:#718075;--green:#365b43}*{box-sizing:border-box}body{margin:0;background:#f6f7ee;color:var(--ink);font-family:system-ui,-apple-system,"Microsoft YaHei",sans-serif}a{color:inherit}header{max-width:1200px;margin:auto;padding:32px 40px;display:flex;justify-content:space-between;align-items:center}.brand{font-size:23px;font-weight:850;letter-spacing:2px}.brand span{background:#ddec95;border-radius:12px;padding:7px 10px;margin-right:10px}header small{color:var(--muted)}main{max-width:1200px;margin:45px auto 0;padding:0 40px}.eyebrow{font-size:12px;letter-spacing:3px;color:var(--green)}h1{font-size:clamp(36px,5vw,62px);letter-spacing:-2px;margin:15px 0}h1 em{font-style:normal;color:#668a4e}.intro{color:var(--muted);line-height:1.8;margin-bottom:38px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:26px;align-items:start}.directory{border:1px solid #dfe5d5;border-radius:24px;background:white;overflow:hidden}.list-heading{display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-bottom:1px solid #edf0e8}.list-heading h2{font-size:18px;margin:0}.count{font-size:12px;background:#f0f4e6;border-radius:20px;padding:6px 12px;color:var(--green)}.list{max-height:420px;overflow-y:auto;scrollbar-color:#b6c7a7 transparent;scrollbar-width:thin;padding:0 12px}.club{display:flex;gap:20px;align-items:center;padding:26px 16px;border-bottom:1px solid #edf0e8;text-decoration:none;border-radius:12px;transition:background .15s}.club:last-child{border-bottom:0}.club:hover{background:#f4f8ec}.number{font-size:13px;color:#8a9b7a}.club strong{display:block;font-size:18px;overflow-wrap:anywhere}.club small{display:block;margin-top:8px;color:var(--muted);overflow-wrap:anywhere}.arrow{margin-left:auto;font-size:24px;color:var(--green)}.random{background:#ddec95;border-radius:24px;padding:30px}.orbit{width:100px;height:100px;border:1px solid #718744;border-radius:50%;display:grid;place-items:center;font-size:50px;margin:10px auto 28px;transform:rotate(-12deg)}.random h2{font-size:26px;margin:0 0 12px}.random p{font-size:14px;line-height:1.8;color:#52633d}.button{display:block;text-align:center;background:var(--green);color:white;text-decoration:none;border-radius:14px;padding:17px;font-weight:700;margin-top:28px}.button:hover{background:#254731}a:focus-visible{outline:3px solid #799b3e;outline-offset:3px}.hint{display:block;text-align:center;margin-top:14px;font-size:12px;color:#52633d}footer{max-width:1200px;margin:34px auto;padding:0 40px;color:var(--muted);font-size:12px;line-height:1.8}@media(max-width:760px){header{padding:24px}header small{display:none}main{margin-top:25px;padding:0 24px}.layout{grid-template-columns:1fr}.random{padding:24px}.orbit{display:none}.list{max-height:350px}footer{padding:0 24px}.club{gap:12px}.club strong{font-size:16px}}
</style></head><body><header><div class="brand"><span>奶</span>奶龙社</div><small>连接社团，发现同好</small></header><main><div class="eyebrow">CLUB DIRECTORY / 社团传送门</div><h1>每一个社团<br>都可以成为<em>奶龙社</em></h1><p class="intro">在这里找到你的同好。也可以交给一点运气，看看下一站会遇见谁。</p><div class="layout"><section class="directory" aria-labelledby="directory-title"><div class="list-heading"><h2 id="directory-title">全部社团</h2><span class="count">${clubs.length} 个社团</span></div><div class="list" tabindex="0" aria-label="社团列表，可滚动">${rows}</div></section><aside class="random"><div class="orbit" aria-hidden="true">✳</div><h2>下一站，随机。</h2><p>不用纠结去哪里，<br>随机打开一个社团的网站。</p><a class="button" href="/random" target="_blank" rel="noopener noreferrer">随机访问 ↗</a><small class="hint">在新标签页打开 · 保留当前列表</small></aside></div></main><footer>奶龙社 · ${clubs.length} 个社团，更多相遇。</footer></body></html>`;
}
export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    const headers = {"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
    if (!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed",{status:405,headers:{...headers,Allow:"GET, HEAD"}});
    if (path === "/random") {
      const v = new Uint32Array(1), limit = Math.floor(2**32/clubs.length)*clubs.length;
      do {crypto.getRandomValues(v);} while(v[0]>=limit);
      return new Response(null,{status:302,headers:{...headers,Location:clubs[v[0]%clubs.length].url}});
    }
    if(path!=="/") return new Response(request.method==="HEAD"?null:"页面不存在",{status:404,headers});
    return new Response(request.method==="HEAD"?null:renderPage(),{headers:{...headers,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'","Referrer-Policy":"no-referrer"}});
  }
};
