// const messageContainer = frame.contentWindow.document.body.querySelector("#message");

const messageContainer = document.getElementById("message");
const messageInput = document.querySelector("#message-to-send");
const send = document.querySelector("#write-message-img");

send.addEventListener("click",function(){
    if(messageInput.value!= ''){
        const message = document.createElement("div");
        message.classList.add("self");
        message.textContent = messageInput.value;
        console.log(message);
        console.log(messageContainer);
        messageContainer.appendChild(message);
        messageInput.value = '';
    }
});
// console.log(messageInput.value);
