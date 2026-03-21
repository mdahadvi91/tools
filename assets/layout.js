document.addEventListener("DOMContentLoaded", async () => {

  // 🔥 BASE PATH AUTO FIX
  let base = location.pathname.includes("/tools/") ? "../assets/" : "assets/";

  // ================= LOAD FUNCTION =================
  async function load(id, file){
    const el = document.getElementById(id);
    if(!el) return;

    try{
      const res = await fetch(file + "?v=" + Date.now()); // cache fix 🔥
      const html = await res.text();
      el.innerHTML = html;
    }catch(err){
      console.log("LOAD FAIL:", file);
    }
  }

  // ================= LOAD ALL =================
  await load("header", base + "header.html");
  await load("sidebar", base + "sidebar.html");
  await load("footer", base + "footer.html");

  // ================= LOAD ADS =================
  async function loadAds(){
    try{
      let res = await fetch(base + "ads.html?v=" + Date.now());
      let html = await res.text();

      let temp = document.createElement("div");
      temp.innerHTML = html;

      if(document.getElementById("adsTop"))
        document.getElementById("adsTop").appendChild(temp.children[0]);

      if(document.getElementById("adsMiddle"))
        document.getElementById("adsMiddle").appendChild(temp.children[1]);

      if(document.getElementById("adsBottom"))
        document.getElementById("adsBottom").appendChild(temp.children[2]);

      // sticky ad (optional 4th)
      if(temp.children[3])
        document.body.appendChild(temp.children[3]);

      // 🔥 Adsense refresh
      setTimeout(()=>{
        document.querySelectorAll(".adsbygoogle").forEach(()=>{
          try{
            (adsbygoogle = window.adsbygoogle || []).push({});
          }catch(e){}
        });
      }, 1200);

    }catch(e){
      console.log("ADS LOAD FAIL");
    }
  }

  loadAds();

});
