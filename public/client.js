const form = document.querySelector('#send-message-form')
const messageContainer = document.querySelector('#message-content')
const messageInput = document.querySelector('#message-to-send');

const socket = io();

//Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)
    scrollToBottom()
})
function scrollToBottom() {
    //Scroll down after hitting send
    messageContainer.scrollTop = messageContainer.scrollHeight

    //Clearing input
    messageInput.value = '';
    messageInput.focus();
}
//Checking for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //Getting message
    const message = messageInput.value;
    // 
    console.log(message)
    const messageToSend = document.createElement('div');
    messageToSend.classList.add('message', 'sender');
    const sender = document.createElement('div')
    sender.classList.add('self');
    sender.innerText = message;
    const time = document.createElement('div')
    time.classList.add('message-time')
    const d = new Date();
    let timeToAdd = d.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    time.innerText = timeToAdd
    sender.appendChild(time)
    messageToSend.appendChild(sender)
    console.log(messageToSend)
    messageContainer.append(messageToSend)
    // 
    scrollToBottom()
    //Emitting message to server
    socket.emit('chatMessage', message);
})

//Output message to DOM
function outputMessage(message) {
    if (message.text == 'Welcome to the chat app!') {
        alert(message.text)
    } else {
        const messageToSend = document.createElement('div');
        messageToSend.classList.add('message', 'receiver');
        const sender = document.createElement('div')
        sender.classList.add('friend');
        sender.innerText = message.text;
        const time = document.createElement('div')
        time.classList.add('message-time')
        time.innerText = message.time
        sender.appendChild(time)
        messageToSend.appendChild(sender)
        console.log(messageToSend)
        messageContainer.append(messageToSend)
    }
}