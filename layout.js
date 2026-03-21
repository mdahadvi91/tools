// ================= AUTO PATH =================

const basePath = location.pathname.includes("/tools/") || location.pathname.includes("/pages/")
  ? "../assets/"
  : "assets/";


// ================= LOAD FUNCTION =================

function loadComponent(id, file){
  fetch(basePath + file)
    .then(res => res.text())
    .then(data => {
      const el = document.getElementById(id);
      if(el){
        el.innerHTML = data;
      }
    })
    .catch(err => console.log("Load error:", file));
}


// ================= LOAD ALL COMPONENTS =================

loadComponent("header", "header.html");
loadComponent("sidebar", "sidebar.html");
loadComponent("footer", "footer.html");

// 🔥 ADS (SEPARATE FILE RECOMMENDED)
loadComponent("adsTop", "ads-top.html");
loadComponent("adsMiddle", "ads-middle.html");
loadComponent("adsBottom", "ads-bottom.html");
