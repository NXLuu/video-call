const socket = io('/')
let peer = {}
let peer2 = {}
let stream;
let stream2 = null;
let startCall;

const videoGrid = document.getElementById('video-grid')


const myPeer = new Peer(undefined, {
    host: 'call-app-11.herokuapp.com',
    secure: true,
    port: '443',
    config: { iceServers: [{ urls: ["stun:ss-turn2.xirsys.com"] }, { username: "J1pQhAekVuETXLdb7nK5vCYHsyq7WpTRmO91e8iM-8U0TaXaA4MztXbTkWd-rFIsAAAAAGB6aLFueHVsdXU=", credential: "3345cf5c-9f38-11eb-bfcb-0242ac140004", urls: ["turn:ss-turn2.xirsys.com:80?transport=udp", "turn:ss-turn2.xirsys.com:3478?transport=udp", "turn:ss-turn2.xirsys.com:80?transport=tcp", "turn:ss-turn2.xirsys.com:3478?transport=tcp", "turns:ss-turn2.xirsys.com:443?transport=tcp", "turns:ss-turn2.xirsys.com:5349?transport=tcp"] }] } /* Sample servers, please use appropriate ones */
})

const myVideo = document.createElement('video')
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(s => {
    stream = s;
    setTimeout(() => {
        console.log(myPeer);
        addVideoStream('video-grid', myVideo, stream, myPeer.id, 'webcam')
    }, 10);
    // debugger
    myPeer.on('call', call => {
        if (call.options.metadata == 'screen') {
            call.answer(stream2);
        } else {
            call.answer(stream);
            const video = document.createElement('video')
            video.controls = true;
            call.on('stream', userVideoStream => {
                if (call.options.metadata == 'start-screen') {
                    console.log(call)
                    peer2[call.peer] = call;
                    call.on('close', () => {
                        video.remove();
                    })
                    addVideoStream('video-grid', video, userVideoStream, call.peer, 'screen')
                } else
                    addVideoStream('video-grid', video, userVideoStream, call.peer, 'webcam')
            })
        }

    })

    socket.on('user-connected', userId => {
        if (stream2 != null) {
            const call = myPeer.call(userId, stream2, { metadata: 'start-screen' });


        }

        connectToNewUser(userId, stream, stream2)


    })

    socket.on('user-shareScreen', userId => {
        const call = myPeer.call(userId, stream, { metadata: 'screen' });
        let video = document.createElement('video');
        video.controls = true;
        call.on('stream', userVideoStream => {
            addVideoStream('video-grid', video, userVideoStream, userId, 'screen')
        })
        call.on('close', () => {
            video.remove()
        })

        peer2[userId] = call;
    })
})

function stopScreen() {
    // debugger
    stream2 = null;
    item.remove();
    socket.emit('stopScreen');
    document.getElementById('share-btn').classList.toggle('hide');
    document.getElementById('stop').classList.toggle('hide');
}
let item;
function shareScreen() {
    if (navigator.mediaDevices.getDisplayMedia == undefined)
        return;

    let screenStream = navigator.mediaDevices.getDisplayMedia({
        cursor: true,
    })
    console.log(screenStream);
    screenStream.then(s => {
        let videoTrack = s.getVideoTracks()[0];
        stream2 = s;

        const screenTrack = stream2.getTracks()[0];
        stream.addTrack(screenTrack);
        console.log(screenTrack);
        item = document.createElement('video');


        addVideoStream('video-grid', item, stream2, myPeer.id, 'screen');
        socket.emit('shareScreen');
        document.getElementById('share-btn').classList.toggle('hide');
        document.getElementById('stop').classList.toggle('hide');


    })
}

function connectToNewUser(userId, stream) {

    const call = myPeer.call(userId, stream, { metadata: "phat" })
    debugger
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {

        addVideoStream('video-grid', video, userVideoStream, userId, 'webcam')
    })

    call.on('close', () => {
        video.remove()
    })

    peer[userId] = call


}

socket.on('user-stopScreen', (userId) => {
    if (peer2[userId]) peer2[userId].close();
})

socket.on('user-disconnected', (userId) => {
    if (peer[userId]) peer[userId].close();
    if (peer2[userId]) peer2[userId].close();
})
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})



function addVideoStream(id, video, stream, idVideo, type) {
    video.srcObject = stream;
    video.controls = true;
    console.log(idVideo);
    video.setAttribute('idVideo', idVideo)
    video.setAttribute('typeVideo', type)
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })


    let sibling = document.querySelector(`video[idVideo="${idVideo}"]`)

    if (sibling) {
        if (sibling.getAttribute('typeVideo') == 'webcam')
            sibling.after(video)
        else
            sibling.before(video)
    } else {
        let div = document.createElement('div');
        div.classList.add('container-video')
        div.append(video);
        document.getElementById(id).append(div)
    }
}