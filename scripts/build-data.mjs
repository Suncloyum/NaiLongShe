import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
const root = new URL("../communities/", import.meta.url);
const names = (await readdir(root)).filter(n=>n.endsWith(".json")).sort();
const entries = [];
const seen = new Set();
for (const name of names) {
 const item = JSON.parse(await readFile(new URL(name,root),"utf8"));
 if (!item || Array.isArray(item) || typeof item.name !== "string" || !item.name.trim() || typeof item.url !== "string") throw new Error(name+": 需要名称和链接");
 const url = new URL(item.url);
 if (!["http:","https:"].includes(url.protocol) || url.username || url.password) throw new Error(name+": 链接无效");
 if (seen.has(url.href)) throw new Error(name+": 重复链接");
 seen.add(url.href);
 entries.push(item);
}
await mkdir(new URL("../generated/",import.meta.url),{recursive:true});
await writeFile(new URL("../generated/communities.json",import.meta.url),JSON.stringify(entries,null,2)+"\n");
console.log("已汇总 "+entries.length+" 个社群文件");
