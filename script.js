function openModal(type){

let text="";

if(type=="about"){
text=`<h3>About Hridoy Tools</h3>
<p>Hridoy Tools Management is a free online tool platform that helps users manage PDF files easily.</p>`;
}

if(type=="contact"){
text=`<h3>Contact</h3>
<p>Email: hridoyvi55@gmail.com</p>
<p>Phone: +971507975837</p>`;
}

if(type=="privacy"){
text=`<h3>Privacy Policy</h3>
<p>We respect your privacy. Files uploaded are processed securely.</p>`;
}

if(type=="terms"){
text=`<h3>Terms</h3>
<p>By using Hridoy Tools you agree to use the services responsibly.</p>`;
}

document.getElementById("modal-text").innerHTML=text;
document.getElementById("modal").style.display="flex";

}

function closeModal(){
document.getElementById("modal").style.display="none";
}