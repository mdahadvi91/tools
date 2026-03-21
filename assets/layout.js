document.addEventListener("DOMContentLoaded", async () => {

  // ================= LOAD PARTIAL =================
  async function loadComponent(id, file){
    const el = document.getElementById(id);
    if(!el) return;

    try{
      const res = await fetch(file);
      const html = await res.text();
      el.innerHTML = html;
    }catch(e){
      console.log("Error loading:", file);
    }
  }

  // ✅ FIXED PATH (IMPORTANT)
  const isToolPage = window.location.pathname.includes("/tools/");

  const base = isToolPage ? "../assets/" : "assets/";

  await loadComponent("header", base + "header.html");
  await loadComponent("sidebar", base + "sidebar.html");
  await loadComponent("footer", base + "footer.html");

  // ================= LOAD ADS =================
  async function loadAds(){
    let res = await fetch(base + "ads.html");
    let html = await res.text();

    let temp = document.createElement("div");
    temp.innerHTML = html;

    if(document.getElementById("adsTop"))
      document.getElementById("adsTop").appendChild(temp.children[0]);

    if(document.getElementById("adsMiddle"))
      document.getElementById("adsMiddle").appendChild(temp.children[1]);

    if(document.getElementById("adsBottom"))
      document.getElementById("adsBottom").appendChild(temp.children[2]);

    if(temp.children[3])
      document.body.appendChild(temp.children[3]);

    setTimeout(()=>{
      try{
        document.querySelectorAll(".adsbygoogle").forEach(()=>{
          (adsbygoogle = window.adsbygoogle || []).push({});
        });
      }catch(e){}
    },1500);
  }

  loadAds();

});
