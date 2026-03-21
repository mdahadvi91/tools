// SIMPLE FIX VERSION (NO CONFUSION)

function loadComponent(id, file){
  const el = document.getElementById(id);
  if(!el) return;

  fetch("assets/" + file)
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
