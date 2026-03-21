document.addEventListener("DOMContentLoaded", async () => {

  async function loadAds(){
    let res = await fetch("/assets/ads.html");
    let html = await res.text();

    let temp = document.createElement("div");
    temp.innerHTML = html;

    // inject
    if(document.getElementById("adsTop"))
      document.getElementById("adsTop").innerHTML =
        temp.children[0].outerHTML;

    if(document.getElementById("adsMiddle"))
      document.getElementById("adsMiddle").innerHTML =
        temp.children[1].outerHTML;

    if(document.getElementById("adsBottom"))
      document.getElementById("adsBottom").innerHTML =
        temp.children[2].outerHTML;

    // sticky
    document.body.appendChild(temp.children[3]);

    // 🔥 ADSENSE INIT (IMPORTANT)
    setTimeout(() => {
      try{
        (adsbygoogle = window.adsbygoogle || []).push({});
        (adsbygoogle = window.adsbygoogle || []).push({});
        (adsbygoogle = window.adsbygoogle || []).push({});
        (adsbygoogle = window.adsbygoogle || []).push({});
      }catch(e){}
    }, 1500);
  }

  loadAds();

});
