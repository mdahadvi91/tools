function loadComponent(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

// Detect path depth
const path = window.location.pathname;

let base = "";

// যদি tools বা pages এর ভিতরে হয়
if (path.includes("/tools/") || path.includes("/pages/")) {
  base = "../";
}

// Load সব
loadComponent("header", base + "assets/header.html");
loadComponent("footer", base + "assets/footer.html");
loadComponent("sidebar", base + "assets/sidebar.html");

// Ads
loadComponent("ad-top", base + "assets/ads.html");
loadComponent("ad-middle", base + "assets/ads.html");
loadComponent("ad-bottom", base + "assets/ads.html");
