
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const socket = io();

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

socket.emit('joinRoom', { username, room })
// console.log(username, room);
socket.on('message', message => {
    console.log(message);
    outPutMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Get room And users Info
socket.on('roomUsers', item => {
    // console.log(item.users);
    outputRoomName(item.room)
    outputRoomUsers(item.users)
})

//Message Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value

    //Emit message to server..
    socket.emit('chatMessage', msg)

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()



})


function outputRoomName(room) {
    roomName.innerHTML = room
}

function outputRoomUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join(' ')}
    `
}


//Output message to DOM
function outPutMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
                ${message.text}
            </p>`;

    document.querySelector('.chat-messages').appendChild(div)

}