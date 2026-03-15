// ================= LEFT MENU OPEN =================

function openLeft(){

closeRight();

document.getElementById("leftMenu").style.transform="translateX(0)";
document.getElementById("overlay").classList.add("show");

history.pushState({menu:"left"},"");

}


// ================= LEFT MENU CLOSE =================

function closeLeft(){

document.getElementById("leftMenu").style.transform="translateX(-100%)";
document.getElementById("overlay").classList.remove("show");

}


// ================= RIGHT MENU OPEN =================

function openRight(){

closeLeft();

document.getElementById("rightMenu").style.transform="translateX(0)";
document.getElementById("overlay").classList.add("show");

history.pushState({menu:"right"},"");

}


// ================= RIGHT MENU CLOSE =================

function closeRight(){

document.getElementById("rightMenu").style.transform="translateX(100%)";
document.getElementById("overlay").classList.remove("show");

}


// ================= BACK BUTTON CLOSE =================

window.onpopstate=function(){

closeLeft();
closeRight();

}


// ================= TOOL SEARCH =================

const searchInput=document.getElementById("toolSearch");

if(searchInput){

const tools=document.querySelectorAll(".tool");

searchInput.addEventListener("keyup",function(){

let value=searchInput.value.toLowerCase();

tools.forEach(function(tool){

let name=tool.getAttribute("data-name");

if(name.includes(value)){
tool.style.display="block";
}else{
tool.style.display="none";
}

});

});

}

/* FILE UPLOAD SYSTEM */

const dropArea=document.getElementById("dropArea");
const fileInput=document.getElementById("fileInput");
const preview=document.getElementById("preview");
const progress=document.getElementById("progressBar");

let files=[];

if(dropArea){

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

const img=document.createElement("img");

img.src=URL.createObjectURL(file);

preview.appendChild(img);

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

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");

let images = [];

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


function toBase64(file){

return new Promise((resolve,reject)=>{

const reader=new FileReader();

reader.readAsDataURL(file);

reader.onload=()=>resolve(reader.result);

reader.onerror=error=>reject(error);

});

}

