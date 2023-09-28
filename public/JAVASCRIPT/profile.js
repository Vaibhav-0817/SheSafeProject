const profileOpener=document.querySelector(".profile-image");
const profileCloser=document.querySelector(".profile-closer");

const openProfile=()=>{
    console.log("in open profile")
    document.body.classList.add("profile-active");
}

const closeProfile=()=>{
    document.body.classList.remove("profile-active");
}
profileOpener.addEventListener("click",openProfile);
profileCloser.addEventListener("click",closeProfile);