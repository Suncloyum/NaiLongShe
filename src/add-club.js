import entries from "../urls.json" with { type: "json" };
import { normalizeClubs } from "./index.js";

const endpoint = "https://api.github.com/repos/Suncloyum/NaiLongShe/issues";
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
  const name = (form.get("name") || "").trim(), description = (form.get("description") || "").trim(), url = (form.get("url") || "").trim();
  if (!name || name.length > 80 || !description || description.length > 120 || url.length > 2048) return message("请填写 1–80 字的名称、1–120 字的简介和有效链接。",400);
  const type = form.get("type") === "group" ? "group" : "site";
  const organization = (form.get("organization") || "").trim(), qqNumber = (form.get("qqNumber") || "").trim(), rawKeywords = (form.get("keywords") || "").trim();
  if (organization.length > 32 || rawKeywords.length > 128 || (type === "group" && !/^[0-9]{5,11}$/.test(qqNumber))) return message("请检查学校/单位、关键词长度，QQ群号须为5–11位数字。",400);
  const keywords = [...new Set(rawKeywords.split(/[,，]/).map(k=>k.trim()).filter(Boolean))];
  const extracted = url.match(/https:\/\/(?:qm\.qq\.com|qun\.qq\.com)\/[^\s，。；！、）)\]}>]+/)?.[0];
  let club;
  try { club = normalizeClubs([{name,url:extracted || url,description,organization,qqNumber,keywords,type}])[0]; } catch { return message("请填写有效的 http:// 或 https:// 社群链接。",400); }
  const headers = {Authorization:"Bearer "+env.GITHUB_WRITE_TOKEN,Accept:"application/vnd.github+json","User-Agent":"NaiLongShe-Worker","X-GitHub-Api-Version":"2022-11-28"};
  try {
    if (normalizeClubs(entries).some(c => c.url === club.url)) return message("这个社群链接已在列表中。",409);
    const issue = await fetch(endpoint, {
      method: "POST",
      headers: {...headers, "Content-Type": "application/json"},
      body: JSON.stringify({
        title: "[社群申请] " + club.name.replace(/[\r\n]/g, " "),
        body: "收录类型："+(type === "group" ? "QQ群聊" : "网站")+"\n学校/单位："+organization+"\n群号："+qqNumber+"\n关键词："+keywords.join(", ")+"\n\n审核通过后可使用以下记录：\n\x60\x60\x60json\n"+JSON.stringify(club,null,2)+"\n\x60\x60\x60\n\n"+"来自网站的社群收录申请，请管理员审核。此申请不会自动修改列表。\n\n社群名称（JSON）：\n    " + JSON.stringify(club.name) + "\n\n社群简介（JSON）：\n    " + JSON.stringify(description) + "\n\n社群链接（JSON）：\n    " + JSON.stringify(club.url) + "\n\n审核通过后，请手动将记录加入 urls.json，再关闭此 Issue。"
      })
    });
    if (!issue.ok) return message("申请提交失败，请稍后再试。",502);
    return message("申请已提交，等待管理员审核。审核通过后才会加入社群列表。",201);
  } catch { return message("暂时无法保存，请稍后再试。",502); }
}
