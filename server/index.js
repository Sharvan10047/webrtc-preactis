import express from 'express'
import bodyParser from 'body-parser'
import { Server } from 'socket.io'

const io = new Server(8000, {
  cors: true
});
const app = express()

app.use(bodyParser.json());

const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()

io.on('connection', (socket) => {
  socket.on("room:join", (data) => {
    const { room, email } = data;
    console.log("User-", email, ", Joined Room", room);
    emailToSocketMapping.set(email, socket.id)
    socketToEmailMapping.set(socket.id, email)
    io.to(room).emit("user:joined", {email, id: socket.id})
    socket.join(room)
    io.to(socket.id).emit("room:join", data)
    // socket.broadcast.to(room).emit("user-joined", {email})
  });

  socket.on("user:call", (data) => {
    const { to, offer } = data;
    const fromEmail = socketToEmailMapping.get(socket.id)
    io.to(to).emit("incomming:call", {from: socket.id, offer, to: fromEmail})
  });

  socket.on("call:accepted", (data) => {
    const  {to, ans} = data;
    io.to(to).emit("call:accepted", {from: socket.id, ans})
  });

  socket.on("peer:nego:needed", (data) => {
    const {to, offer} = data
    io.to(to).emit("peer:nego:needed", {from: socket.id, offer})
  })

  socket.on("peer:nego:done", (data) => {
    const {to, ans} = data
    io.to(to).emit("peer:nego:final", {from: socket.id, ans})
  })
})

// app.listen('8000', () => {
//   console.log('Server run on port 8000')
// })

// io.listen('8001', () => {
//   console.log('Server run on port 8001')
// })