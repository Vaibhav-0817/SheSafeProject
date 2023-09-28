const sendChatBtn=document.querySelector("#send-btn");
const chatInput=document.querySelector(".chat-input textarea");
const chatbox=document.querySelector(".chatbox");
const chatBotOpener=document.querySelector("#chat-bot-opener");
const chatBotCloser=document.querySelector(".xmark");

function gotlocation(position){
 document.getElementById("latloc").value=position.coords.latitude;
 document.getElementById("lngloc").value=position.coords.longitude;
}
function failed(){
  console.log("error");
}
document.querySelector("body").addEventListener('mouseover',async()=>{
  navigator.geolocation.getCurrentPosition(gotlocation,failed,{enableHighAccuracy: true});
})

let userMessage;

const createChatLi = (message,className) => {
    const chatLi=document.createElement("li");
    chatLi.classList.add("chat",className);
    let chatContent =className === "outgoing" ? `<p></p>` : `<i class="fa-solid fa-robot"></i><p></p>`;        
    chatLi.innerHTML=chatContent;
    chatLi.querySelector("p").textContent=message;
    return chatLi;
}

const handleChat = () => {
   userMessage=chatInput.value.trim();
   if(!userMessage) return;
   chatInput.value="";
   chatbox.appendChild(createChatLi(userMessage,"outgoing"));
   setTimeout(()=>{
    chatbox.appendChild(createChatLi("Let me look for the answer...","incoming"));
   },600)
}
const openChatBot=()=>{
    document.body.classList.add("show-chatbot");
}
const closeChatBot=()=>{
    document.body.classList.remove("show-chatbot");
}
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
  window.addEventListener('dfMessengerLoaded', function (event) {
    const dfMessenger = document.querySelector('df-messenger'); 
    const style = document.createElement('style');

    const nonMobileMinWidth = 501; // Breakpoint where DF Messenger switches between mobile/non-mobile styles

    style.textContent = '@media screen and (min-width: ' + nonMobileMinWidth + 'px) { .chat-wrapper { max-height: 65% } }';

    dfMessenger.shadowRoot.querySelector('df-messenger-chat').shadowRoot.appendChild(style);
  }
  )

chatBotCloser.addEventListener("click",closeChatBot);
chatBotOpener.addEventListener("click",openChatBot);
sendChatBtn.addEventListener("click",handleChat);


