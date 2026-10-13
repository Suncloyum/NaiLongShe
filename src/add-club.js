import entries from "../generated/communities.json" with { type: "json" };
import { normalizeClubs } from "./index.js";

const endpoint = "https://api.github.com/repos/Suncloyum/NaiLongShe";
function message(text, status, code = "") {
  const errors = {400:["FORM_INVALID","输入内容不符合要求，请修改后提交。"],403:["SOURCE_INVALID","请返回首页刷新后提交；若仍失败，请将错误编号发给管理员。"],409:["ALREADY_LISTED","该链接已收录，无需重复申请。"],413:["FORM_TOO_LARGE","请缩短输入内容后重试。"],503:["TOKEN_NOT_CONFIGURED","管理员需要在 Worker 中配置 GITHUB_WRITE_TOKEN。"],502:["GITHUB_UNAVAILABLE","请将本页错误详情和编号发给管理员。"]};
  const info = errors[status];
  const detail = info ? '<p><strong>错误编号：' + (code || info[0]) + '</strong></p><p>' + info[1] + '</p>' : "";
  return new Response('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>添加社群</title><body style="font-family:system-ui;background:#f6f7ee;padding:40px;line-height:1.8"><h1>添加社群</h1><p>'+text+'</p>'+detail+'<a href="/">返回社群列表</a></body></html>', {status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
export async function addClub(request, env) {
  const target = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const site = request.headers.get("Sec-Fetch-Site");
  const allowed = new Set([new URL(target).hostname, "xn--yuso35evj0a.com", "www.xn--yuso35evj0a.com", "nailongshe-random-redirect.suncloyum.workers.dev"]);
  const allowedSource = value => {
    try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && allowed.has(u.hostname); } catch { return false; }
  };
  const hasOrigin = origin && origin !== "null";
  const trusted = hasOrigin ? allowedSource(origin) : (allowedSource(referer) || site === "same-origin");
  if (!trusted) {
    const escape = value => String(value || "未提供").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    return message("请求来源校验失败。校验详情：Origin=" + escape(origin) + "；Sec-Fetch-Site=" + escape(site) + "；目标=" + escape(target) + "。",403);
  }
  if (!env.GITHUB_WRITE_TOKEN) return message("添加功能正在配置中，请稍后再试。",503);
  if (Number(request.headers.get("Content-Length")) > 8192) return message("输入内容过长。",413);
  const body = await request.text();
  if (body.length > 8192) return message("输入内容过长。",413);
  const form = new URLSearchParams(body);
  const name = (form.get("name") || "").trim(), description = (form.get("description") || "").trim(), url = (form.get("url") || "").trim();
  if (!name || name.length > 80 || description.length > 120 || url.length > 2048) return message("名称必填；网站须填写链接，QQ群须填写群号；名称最多80字，简介选填、最多120字。",400);
  const type = form.get("type") === "group" ? "group" : "site";
  const organization = (form.get("organization") || "").trim(), qqNumber = (form.get("qqNumber") || "").trim(), rawKeywords = (form.get("keywords") || "").trim();
  if (organization.length > 32 || rawKeywords.length > 128 || ((type === "group" || qqNumber) && !/^[0-9]{5,11}$/.test(qqNumber))) return message("请检查学校/单位、关键词长度，QQ群号须为5–11位数字。",400);
  const keywords = [...new Set(rawKeywords.split(/[,，]/).map(k=>k.trim()).filter(Boolean))];
  const extracted = url.match(/https:\/\/(?:qm\.qq\.com|qun\.qq\.com)\/[^\s，。；！、）)\]}>]+/)?.[0];
  let club;
  try { club = normalizeClubs([{name,url:extracted || url,description,organization,qqNumber,keywords,type}])[0]; } catch { return message("请填写有效的 http:// 或 https:// 社群链接。",400); }
  const headers = {Authorization:"Bearer "+env.GITHUB_WRITE_TOKEN,Accept:"application/vnd.github+json","User-Agent":"NaiLongShe-Worker","X-GitHub-Api-Version":"2022-11-28"};
  try {
    if (normalizeClubs(entries).some(c => (club.url && c.url === club.url) || (club.type === "group" && c.type === "group" && c.qqNumber === club.qqNumber))) return message("这个社群链接已在列表中。",409);
    const api = async (path, method = "GET", payload) => {
      const response = await fetch(endpoint + path,{method,headers:{...headers,"Content-Type":"application/json"},...(payload ? {body:JSON.stringify(payload)} : {})});
      if (!response.ok) {
        const details = await response.json().catch(()=>({}));
        const error=new Error("GitHub API");
        error.status=response.status;
        error.stage=path.startsWith("/pulls") ? "创建 PR" : path==="/git/refs" ? "创建申请分支" : method==="PUT" ? "写入社群文件" : "读取仓库数据";
        error.reason=typeof details.message==="string" ? details.message.slice(0,300) : "未提供原因";
        error.permissions=response.headers.get("x-accepted-github-permissions") || "";
        throw error;
      }
      return response.json();
    };
    const main = await api("/git/ref/heads/main");
    const base = main.object.sha;
    const files = await api("/contents/communities?ref=" + base);
    const current = await Promise.all(files.filter(f=>f.name.endsWith(".json")).map(async f=>{
      const data=await api("/contents/"+encodeURI(f.path)+"?ref="+base);
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\s/g,"")),c=>c.charCodeAt(0))));
    }));
    if(normalizeClubs(current).some(c=>c.url===club.url)) return message("这个社群链接已在列表中。",409);
    const id=crypto.randomUUID();
    const branch="applications/"+id;
    await api("/git/refs","POST",{ref:"refs/heads/"+branch,sha:base});
    let binary="";
    for(const byte of new TextEncoder().encode(JSON.stringify(club,null,2)+"\n")) binary+=String.fromCharCode(byte);
    await api("/contents/communities/"+id+".json","PUT",{message:"Propose community listing",content:btoa(binary),branch});
    const pr = await api("/pulls","POST",{title:"[社群申请] "+club.name.replace(/[\r\n]/g," "),head:branch,base:"main",body:"来自网页的社群申请，请审核新增记录。合并后自动部署。\n\n"+JSON.stringify(club,null,2)});
    return message("申请已提交为 PR #"+pr.number+"，等待管理员审核合并。合并后才会加入列表。",201);
  } catch (error) { const status=error.status; const escape=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); return message(status ? escape(error.stage)+"失败（GitHub HTTP "+status+"）。GitHub 原因："+escape(error.reason)+(error.permissions ? "；此操作所需权限："+escape(error.permissions) : "")+"。请确认 Worker 保存的是更新后的 GitHub 令牌。" : "连接 GitHub 时发生网络异常，请稍后重试。",502,status ? "GITHUB_HTTP_"+status : "GITHUB_NETWORK_ERROR"); }
}
