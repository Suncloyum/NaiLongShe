import { normalizeClubs } from "./index.js";

const endpoint = "https://api.github.com/repos/Suncloyum/NaiLongShe/contents/urls.json";
function message(text, status) {
  return new Response('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>添加社群</title><body style="font-family:system-ui;background:#f6f7ee;padding:40px;line-height:1.8"><h1>添加社群</h1><p>'+text+'</p><a href="/">返回社群列表</a></body></html>', {status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
export async function addClub(request, env) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) return message("请求来源无效，请从首页提交。",403);
  if (!env.GITHUB_WRITE_TOKEN) return message("添加功能正在配置中，请稍后再试。",503);
  if (Number(request.headers.get("Content-Length")) > 8192) return message("输入内容过长。",413);
  const body = await request.text();
  if (body.length > 8192) return message("输入内容过长。",413);
  const form = new URLSearchParams(body);
  const name = (form.get("description") || "").trim(), url = (form.get("url") || "").trim();
  if (!name || name.length > 120 || url.length > 2048) return message("请填写 1–120 字的社群简介和有效链接。",400);
  let club;
  try { club = normalizeClubs([{name,url}])[0]; } catch { return message("请填写有效的 http:// 或 https:// 社群链接。",400); }
  const headers = {Authorization:"Bearer "+env.GITHUB_WRITE_TOKEN,Accept:"application/vnd.github+json","User-Agent":"NaiLongShe-Worker","X-GitHub-Api-Version":"2022-11-28"};
  try {
    for(let attempt=0;attempt<3;attempt++) {
      const read = await fetch(endpoint+"?ref=main",{headers});
      if(!read.ok) return message("暂时无法保存，请稍后再试。",502);
      const file = await read.json();
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g,"")),c=>c.charCodeAt(0));
      const list = normalizeClubs(JSON.parse(new TextDecoder().decode(bytes)));
      if(list.some(c=>c.url===club.url)) return message("这个社群链接已在列表中。",409);
      list.push(club);
      const data = new TextEncoder().encode(JSON.stringify(list,null,2)+"\n");
      let binary=""; for(const byte of data) binary+=String.fromCharCode(byte);
      const write=await fetch(endpoint,{method:"PUT",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({message:"Add club via website",content:btoa(binary),sha:file.sha,branch:"main"})});
      if(write.status===409) continue;
      if(!write.ok) return message("暂时无法保存，请稍后再试。",502);
      return message("社群已保存！网站正在自动更新，通常几分钟后会出现在列表中。",201);
    }
    return message("提交人数较多，请稍后重试。",409);
  } catch { return message("暂时无法保存，请稍后再试。",502); }
}
