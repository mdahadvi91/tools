document.addEventListener("DOMContentLoaded", async () => {

  // =========================
  // LOAD ADS.HTML
  // =========================
  async function loadAds() {
    try {
      let res = await fetch("/assets/ads.html");
      let html = await res.text();

      let temp = document.createElement("div");
      temp.innerHTML = html;

      // TOP
      let top = document.getElementById("adsTop");
      if(top && temp.querySelector("#ad-top")){
        top.innerHTML = temp.querySelector("#ad-top").outerHTML;
      }

      // MIDDLE
      let mid = document.getElementById("adsMiddle");
      if(mid && temp.querySelector("#ad-middle")){
        mid.innerHTML = temp.querySelector("#ad-middle").outerHTML;
      }

      // BOTTOM
      let bot = document.getElementById("adsBottom");
      if(bot && temp.querySelector("#ad-bottom")){
        bot.innerHTML = temp.querySelector("#ad-bottom").outerHTML;
      }

      // STICKY (auto body te add hobe)
      let sticky = temp.querySelector("#ad-sticky");
      if(sticky){
        document.body.appendChild(sticky);
      }

    } catch(e){
      console.log("Ads load error:", e);
    }
  }

  loadAds();

});


// ADSENSE INIT
setTimeout(() => {
  try {
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
  } catch(e) {
    console.log("Adsense error", e);
  }
}, 1000);
