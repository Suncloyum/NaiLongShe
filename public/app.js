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
    document.querySelector(".random .button").href = doc.querySelector(".random .button").getAttribute("href");
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
