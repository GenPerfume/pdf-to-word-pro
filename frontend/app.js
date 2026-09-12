const API = window.API_URL || "http://localhost:8000";

const input = document.querySelector("#fileInput");
const choose = document.querySelector("#chooseBtn");
const drop = document.querySelector("#dropzone");
const card = document.querySelector("#fileCard");
const convert = document.querySelector("#convertBtn");
const download = document.querySelector("#downloadBtn");
const remove = document.querySelector("#removeBtn");
const nameEl = document.querySelector("#fileName");
const sizeEl = document.querySelector("#fileSize");
const statusEl = document.querySelector("#status");
const bar = document.querySelector("#progressBar");
const errorEl = document.querySelector("#error");

let selected = null;

choose.onclick = () => input.click();
drop.onclick = e => { if(!e.target.closest("button")) input.click(); };
input.onchange = () => input.files[0] && selectFile(input.files[0]);

["dragenter","dragover"].forEach(ev => drop.addEventListener(ev,e=>{
  e.preventDefault(); drop.classList.add("drag");
}));
["dragleave","drop"].forEach(ev => drop.addEventListener(ev,e=>{
  e.preventDefault(); drop.classList.remove("drag");
}));
drop.addEventListener("drop",e=>{
  const f=e.dataTransfer.files[0];
  if(f) selectFile(f);
});

remove.onclick=()=>{
  selected=null; input.value=""; card.classList.add("hidden");
  convert.classList.add("hidden"); download.classList.add("hidden"); errorEl.classList.add("hidden");
  bar.style.width="0%";
};

function formatBytes(n){
  if(n<1024) return n+" B";
  if(n<1024**2) return (n/1024).toFixed(1)+" KB";
  return (n/1024**2).toFixed(1)+" MB";
}
function selectFile(file){
  if(!file.name.toLowerCase().endsWith(".pdf")){
    showError("Vui lòng chọn file PDF.");
    return;
  }
  selected=file;
  nameEl.textContent=file.name;
  sizeEl.textContent=formatBytes(file.size);
  statusEl.textContent="Sẵn sàng chuyển đổi";
  bar.style.width="0%";
  card.classList.remove("hidden"); convert.classList.remove("hidden");
  download.classList.add("hidden"); errorEl.classList.add("hidden");
}
function showError(msg){errorEl.textContent=msg;errorEl.classList.remove("hidden");}

convert.onclick=async()=>{
  if(!selected) return;
  convert.disabled=true; convert.style.opacity=.65;
  statusEl.textContent="Đang tải PDF lên máy chủ…"; bar.style.width="15%";
  try{
    const form=new FormData(); form.append("file",selected);
    statusEl.textContent="Đang phân tích và chuyển đổi…"; bar.style.width="35%";
    const res=await fetch(API+"/api/convert",{method:"POST",body:form});
    if(!res.ok){
      let msg="Không thể chuyển đổi file.";
      try{const j=await res.json();msg=j.detail||msg}catch{}
      throw new Error(msg);
    }
    bar.style.width="90%";
    const blob=await res.blob();
    const url=URL.createObjectURL(blob);
    download.href=url;
    download.download=selected.name.replace(/\.pdf$/i,"")+".docx";
    download.classList.remove("hidden");
    bar.style.width="100%";
    statusEl.textContent="Hoàn tất — file Word đã sẵn sàng.";
  }catch(e){
    showError(e.message); statusEl.textContent="Chuyển đổi thất bại.";
  }finally{
    convert.disabled=false; convert.style.opacity=1;
  }
};
