const form = document.querySelector(".search-form");
const input = form.elements.q;
let timer, controller;
async function search() {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const params = new URLSearchParams(new FormData(form));
  try {
    const response = await fetch("/directory?" + params, {signal});
    if (!response.ok) throw new Error("搜索失败");
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    document.querySelector(".list").replaceWith(doc.querySelector(".list"));
    document.querySelector(".count").textContent = doc.querySelector(".count").textContent;
    for (const name of ["random-site","random-group","random-all"]) document.querySelector("."+name).href = doc.querySelector("."+name).getAttribute("href");
    history.replaceState(null, "", "/?" + params);
  } catch (error) {
    if (error.name !== "AbortError") {
      let notice = document.querySelector(".search-error");
      if (!notice) {notice=document.createElement("p");notice.className="search-error";notice.setAttribute("role","status");form.after(notice);}
      notice.textContent="搜索暂时失败，请重试。";
    }
  }
}
form.addEventListener("submit", event => {event.preventDefault();clearTimeout(timer);search();});
input.addEventListener("input", () => {clearTimeout(timer);timer=setTimeout(search,250);});
form.elements.type.addEventListener("change", () => {clearTimeout(timer);search();});
const button=document.querySelector(".background-switch");
let images;
button.addEventListener("click",async()=>{
  button.disabled=true;
  try {
    images ??= await fetch("/api/backgrounds").then(r=>{if(!r.ok)throw new Error();return r.json();});
    const current=getComputedStyle(document.body,"::before").backgroundImage;
    const options=images.filter(path=>!current.includes(path));
    const selected=options[Math.floor(Math.random()*options.length)] || images[0];
    const picture=new Image();
    picture.src=selected;
    await picture.decode();
    document.body.style.setProperty("--wallpaper",'url("'+selected+'")');
  } catch {button.textContent="重试切换 ↻";}
  finally {button.disabled=false;}
});

const application=document.querySelector('form[action="/clubs"]');
function requirements(){
 const group=application.elements.type.value==="group";
 application.elements.qqNumber.required=group;
 application.elements.url.required=!group;
}
application.elements.type.addEventListener("change",requirements);
requirements();
const dialog=document.querySelector("#group-dialog");
document.querySelector("#close-group").addEventListener("click",()=>dialog.close());
async function showGroup(group){
 dialog.querySelector(".group-name").textContent=group.name;
 dialog.querySelector(".group-description").textContent=group.description || "";
 dialog.querySelector(".group-number").textContent="QQ群号："+group.qqNumber;
 dialog.querySelector(".copy-status").textContent="正在复制群号…";
 if(!dialog.open)dialog.showModal();
 try{await navigator.clipboard.writeText(group.qqNumber);dialog.querySelector(".copy-status").textContent="已复制群号，请在QQ中搜索并申请加入。";}
 catch{dialog.querySelector(".copy-status").textContent="自动复制失败，请手动复制上方群号。";}
}
document.addEventListener("click",event=>{
 const card=event.target.closest("[data-qq]");
 if(card?.dataset.qq){event.preventDefault();showGroup({name:card.dataset.name,description:card.dataset.description,qqNumber:card.dataset.qq});}
});
document.querySelector(".random-options").addEventListener("click",async event=>{
 const link=event.target.closest("a");
 if(!link)return;
 event.preventDefault();
 const tab=window.open("about:blank","_blank");
 try{
  const endpoint=new URL(link.href);endpoint.searchParams.set("format","json");
  const response=await fetch(endpoint);
  if(!response.ok)throw Error("暂无符合条件的社群");
  const group=await response.json();
  if(!group.url){tab?.close();await showGroup(group);}
  else if(tab){tab.opener=null;tab.location.replace(group.url);}
  else{alert("浏览器拦截了新标签页，请允许弹出窗口后重试。");}
 }catch(error){tab?.close();alert(error.message);}
});
const groupQuery=new URLSearchParams(location.search).get("group");
if(groupQuery){const card=Array.from(document.querySelectorAll("[data-qq]")).find(c=>c.dataset.qq===groupQuery);if(card)showGroup({name:card.dataset.name,description:card.dataset.description,qqNumber:groupQuery});}
