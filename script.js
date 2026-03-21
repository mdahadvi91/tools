/*
FILE: script.js
PURPOSE: All interactive logic

FEATURES:
- Sidebar toggle
- Search filter
- File upload system
- PDF convert
- Dark mode ✅
- Loader ✅

LAST UPDATED: 2026
*/


// ================= SIDEBAR CONTROLS =================

function openLeft(){
  closeRight();
  document.getElementById("leftMenu").style.transform="translateX(0)";
  document.getElementById("overlay").classList.add("show");
  history.pushState({menu:"left"},"");
}

function closeLeft(){
  document.getElementById("leftMenu").style.transform="translateX(-100%)";
  document.getElementById("overlay").classList.remove("show");
}

function openRight(){
  closeLeft();
  document.getElementById("rightMenu").style.transform="translateX(0)";
  document.getElementById("overlay").classList.add("show");
  history.pushState({menu:"right"},"");
}

function closeRight(){
  document.getElementById("rightMenu").style.transform="translateX(100%)";
  document.getElementById("overlay").classList.remove("show");
}

window.onpopstate=function(){
  closeLeft();
  closeRight();
};


// ================= TOOL SEARCH =================

const searchInput=document.getElementById("toolSearch");

if(searchInput){

  const tools=document.querySelectorAll(".tool");

  searchInput.addEventListener("keyup",function(){

    let value=searchInput.value.toLowerCase();

    tools.forEach(function(tool){

      let name=tool.getAttribute("data-name");

      if(!name){
        name=tool.innerText.toLowerCase();
      }

      if(name.includes(value)){
        tool.style.display="block";
      }else{
        tool.style.display="none";
      }

    });

  });

}


// ================= FILE UPLOAD SYSTEM =================

const dropArea=document.getElementById("dropArea");
const fileInput=document.getElementById("fileInput");
const preview=document.getElementById("preview");
const progress=document.getElementById("progressBar");

let files=[];

if(dropArea && fileInput){

  dropArea.addEventListener("click",()=>fileInput.click());

  dropArea.addEventListener("dragover",(e)=>{
    e.preventDefault();
    dropArea.style.background="#f5f5f5";
  });

  dropArea.addEventListener("dragleave",()=>{
    dropArea.style.background="white";
  });

  dropArea.addEventListener("drop",(e)=>{
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change",()=>{
    handleFiles(fileInput.files);
  });

}

function handleFiles(selectedFiles){

  for(let file of selectedFiles){

    files.push(file);

    if(preview){
      const img=document.createElement("img");
      img.src=URL.createObjectURL(file);
      preview.appendChild(img);
    }

  }

}

function startProgress(){

  let percent=0;

  const interval=setInterval(()=>{

    percent+=5;

    if(progress) progress.style.width=percent+"%";

    if(percent>=100) clearInterval(interval);

  },100);

}


// ================= IMAGE → PDF SYSTEM =================

const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");

let images = [];

if(imageInput && convertBtn && preview){

  imageInput.addEventListener("change", function(){

    preview.innerHTML="";
    images=[];

    const files = imageInput.files;

    for(let i=0;i<files.length;i++){

      const file = files[i];
      images.push(file);

      const reader = new FileReader();

      reader.onload=function(e){

        const img=document.createElement("img");
        img.src=e.target.result;
        preview.appendChild(img);

      }

      reader.readAsDataURL(file);

    }

  });


  convertBtn.addEventListener("click", async function(){

    if(images.length===0){
      alert("Please select images");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for(let i=0;i<images.length;i++){

      const imgData = await toBase64(images[i]);

      const img = new Image();
      img.src = imgData;

      await new Promise(resolve=>{
        img.onload=resolve;
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;

      if(i>0){
        pdf.addPage();
      }

      pdf.addImage(imgData,"JPEG",0,0,width,height);

    }

    pdf.save("converted.pdf");

  });

}


// ================= BASE64 CONVERTER =================

function toBase64(file){

  return new Promise((resolve,reject)=>{

    const reader=new FileReader();

    reader.readAsDataURL(file);

    reader.onload=()=>resolve(reader.result);
    reader.onerror=error=>reject(error);

  });

}


// ================= 🌙 DARK MODE =================

function toggleDark(){

  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("theme","dark");
  }else{
    localStorage.setItem("theme","light");
  }

}


// ================= ⚡ LOAD SETTINGS =================

window.addEventListener("load", ()=>{

  // load saved theme
  if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark");
  }

  // hide loader
  const loader=document.getElementById("loader");
  if(loader){
    loader.style.display="none";
  }

});
