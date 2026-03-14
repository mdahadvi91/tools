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
