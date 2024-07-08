const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin:"http://localhost:2000",
        methods: ["GET", "POST"]
    }
})
app.use(cors())
app.use(bodyParser.json());

const users = {};

// Temporary store for offline messages
let offlineMessages = {};

io.on("connection", (socket) => {
    console.log("connected", socket.id)

    socket.on("register", (username) => {
        users[username] = socket.id;
        console.log('user registered', username);

        if (offlineMessages[username]) {
            offlineMessages[username].forEach(msg => {
                socket.emit('message', msg);
            });
            delete offlineMessages[username];
        }
    }
    );

    socket.on('sendMeassage', ({id, sender, recivers, subject, body, date, status}) => {
        recivers.forEach((reciver) => {
            const recipientSocketId = users[reciver];
            if(recipientSocketId){
                io.to(recipientSocketId).emit('message', {
                    id, sender, recivers, subject, body, date, status
                })
            }
            else {
                if(!offlineMessages[reciver]) {
                    offlineMessages[reciver] = [];
                }
    
                offlineMessages[reciver].push({id, sender, recivers, subject, body, date, status})
            }
            console.log(id, sender, recivers, subject, body, date, status)
            
        })
    });

    
})

app.use(require('./routes/categoryRoute'))

app.use(require('./routes/productsRoute'))

app.use(require('./routes/attributesRoute'))

app.use(require('./routes/meaggesRoute'))

app.use(require('./routes/usersRoute'))
  

server.listen(port, () => {
    console.log(`listening on *:${port}`);
  });