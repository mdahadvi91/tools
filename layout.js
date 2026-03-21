// AUTO PATH DETECT
const basePath = location.pathname.includes("/tools/") || location.pathname.includes("/pages/")
  ? "../assets/"
  : "assets/";

// LOAD FUNCTION
function loadComponent(id, file){
  fetch(basePath + file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;

      // 🔥 IMPORTANT: re-run JS after load
      if(id === "header"){
        setTimeout(() => {
          if(typeof initSearch === "function"){
            initSearch();
          }
        }, 200);
      }
    });
}

// LOAD ALL (FIXED)
loadComponent("header", "header.html");
loadComponent("sidebar", "sidebar.html");
loadComponent("footer", "footer.html");
loadComponent("adsTop", "ads.html");
loadComponent("adsMiddle", "ads.html");
loadComponent("adsBottom", "ads.html");
