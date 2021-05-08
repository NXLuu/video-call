const socket = io('/')
const videoGrid = document.getElementById('video-grid')
console.log(videoGrid)
const myPeer = new Peer(undefined, {
    host: 'call-app-11.herokuapp.com',
    secure: true,
    port: '443',
    config: { iceServers: [{ urls: ["stun:ss-turn2.xirsys.com"] }, { username: "J1pQhAekVuETXLdb7nK5vCYHsyq7WpTRmO91e8iM-8U0TaXaA4MztXbTkWd-rFIsAAAAAGB6aLFueHVsdXU=", credential: "3345cf5c-9f38-11eb-bfcb-0242ac140004", urls: ["turn:ss-turn2.xirsys.com:80?transport=udp", "turn:ss-turn2.xirsys.com:3478?transport=udp", "turn:ss-turn2.xirsys.com:80?transport=tcp", "turn:ss-turn2.xirsys.com:3478?transport=tcp", "turns:ss-turn2.xirsys.com:443?transport=tcp", "turns:ss-turn2.xirsys.com:5349?transport=tcp"] }] } /* Sample servers, please use appropriate ones */
})
const myVideo = document.createElement('video')
myVideo.muted = true;

let peer = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log(1)
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)

    })


})

function connectToNewUser(userId, stream) {

    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {

        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peer[userId] = call


}

socket.on('user-disconnected', (userId) => {
    if (peer[userId]) peer[userId].close();
})
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})




function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}