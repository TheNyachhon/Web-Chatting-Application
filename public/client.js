const form = document.querySelector('#send-message-form')
const messageContainer = document.querySelector('#message-content')
const messageInput = document.querySelector('#message-to-send');

const socket = io();

//Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)
    
    //Scroll down after hitting send
    messageContainer.scrollTop = messageContainer.scrollHeight

    //Clearing input
    messageInput.value = '';
    messageInput.focus();
    
})

//Checking for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //Getting message
    const message = messageInput.value;
    //Emitting message to server
    socket.emit('chatMessage', message);
})

//Output message to DOM
function outputMessage(message) {
    const messageToSend = document.createElement('div');
    messageToSend.classList.add('message', 'sender');
    const sender = document.createElement('div')
    sender.classList.add('self');
    sender.innerText = message.text;
    messageToSend.appendChild(sender)
    console.log(messageToSend)
    messageContainer.append(messageToSend)
}