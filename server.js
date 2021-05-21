console.log("hi")
const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/create-room', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

app.post('/join-room1', (req, res) => {
    res.redirect(`/${req.body.id}`)
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })

        socket.on('shareScreen', () => {
            socket.broadcast.to(roomId).emit('user-shareScreen', userId)
        })
        socket.on('stopScreen', () => {
            socket.broadcast.to(roomId).emit('user-stopScreen', userId)
        })
    })
})
server.listen(process.env.PORT || 3000)