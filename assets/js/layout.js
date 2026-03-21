async function loadComponent(id, file){
  try{
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  }catch(e){
    console.error("Component load failed:", file);
  }
}

window.addEventListener("DOMContentLoaded", ()=>{

  loadComponent("header","assets/components/header.html");
  loadComponent("sidebar","assets/components/sidebar.html");
  loadComponent("footer","assets/components/footer.html");
  loadComponent("ads","assets/components/ads.html");

});
