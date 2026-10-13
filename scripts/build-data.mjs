import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
const root = new URL("../communities/", import.meta.url);
const names = (await readdir(root)).filter(n=>n.endsWith(".json")).sort();
const entries = [];
const seen = new Set();
for (const name of names) {
 const item = JSON.parse(await readFile(new URL(name,root),"utf8"));
 if (!item || Array.isArray(item) || typeof item.name !== "string" || !item.name.trim() || (item.url != null && typeof item.url !== "string")) throw new Error(name+": 需要名称和链接");
 const group=item.type==="group";
 if(group && !/^[0-9]{5,11}$/.test(item.qqNumber || "")) throw new Error(name+": QQ群必须填写群号");
 const url=item.url ? new URL(item.url) : null;
 if(!group && !url) throw new Error(name+": 网站必须填写链接");
 if(url && (!["http:","https:"].includes(url.protocol) || url.username || url.password)) throw new Error(name+": 链接无效");
 const keys=[...(url ? ["url:"+url.href] : []),...(group ? ["qq:"+item.qqNumber] : [])];
 for(const key of keys){if(seen.has(key))throw new Error(name+": 重复社群");seen.add(key);}
 entries.push(item);
}
await mkdir(new URL("../generated/",import.meta.url),{recursive:true});
await writeFile(new URL("../generated/communities.json",import.meta.url),JSON.stringify(entries,null,2)+"\n");
console.log("已汇总 "+entries.length+" 个社群文件");
