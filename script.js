// ================= SIDEBAR =================

function openLeft(){
  closeRight();
  document.getElementById("leftMenu").style.transform="translateX(0)";
  document.getElementById("overlay").classList.add("show");
}

function closeLeft(){
  document.getElementById("leftMenu").style.transform="translateX(-100%)";
  document.getElementById("overlay").classList.remove("show");
}

function openRight(){
  closeLeft();
  document.getElementById("rightMenu").style.transform="translateX(0)";
  document.getElementById("overlay").classList.add("show");
}

function closeRight(){
  document.getElementById("rightMenu").style.transform="translateX(100%)";
  document.getElementById("overlay").classList.remove("show");
}


// ================= SEARCH =================

function initSearch(){
  const searchInput=document.getElementById("toolSearch");

  if(searchInput){
    const tools=document.querySelectorAll(".tool");

    searchInput.addEventListener("keyup",function(){
      let value=searchInput.value.toLowerCase();

      tools.forEach(tool=>{
        let name=tool.innerText.toLowerCase();
        tool.style.display = name.includes(value) ? "block" : "none";
      });
    });
  }
}


// ================= DARK MODE =================

function toggleDark(){
  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("theme","dark");
  }else{
    localStorage.setItem("theme","light");
  }
}


// ================= LOAD =================

window.addEventListener("load", ()=>{

  // DARK MODE LOAD
  if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark");
  }

  // LOADER
  const loader=document.getElementById("loader");
  if(loader){
    loader.style.display="none";
  }

  // SEARCH INIT (IMPORTANT FIX 🔥)
  initSearch();

});


// ================= BACK =================

function goBack(){
  if(document.referrer !== ""){
    history.back();
  }else{
    window.location.href = "/index.html";
  }
}
