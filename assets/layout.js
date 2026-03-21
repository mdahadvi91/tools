const basePath = location.pathname.includes("/tools/") || location.pathname.includes("/pages/")
  ? "../assets/"
  : "assets/";

function loadComponent(id, file){
  const el = document.getElementById(id);
  if(!el) return;

  fetch(basePath + file)
    .then(res => res.text())
    .then(data => {
      el.innerHTML = data;
    });
}

// LOAD ALL
loadComponent("header", "header.html");
loadComponent("sidebar", "sidebar.html");
loadComponent("footer", "footer.html");
loadComponent("adsTop", "ads.html");
loadComponent("adsMiddle", "ads.html");
loadComponent("adsBottom", "ads.html");
