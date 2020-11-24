const app = require('express')();
const http = require('http').createServer(app);
const shortid = require('shortid');
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

global.messages = new Array();
global.users = new Array();
global.nicknames = ["Ezio", "Kratos", "Iron Man", "Spiderman", "Doctor Who", "Link", "Sonic"];
global.rooms = []

io.on('connection', (socket) => {
    let id = socket.handshake.query['idClient']
    console.log('A user connected: ' + id);
    let nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
    let newUser = {
        id: id,
        nickname,
        isAlive: true,
        roomSelected: ''
    }
    users.push(newUser);

    socket.emit('setUpdateUser', newUser)
    socket.emit('setUsers', users)
    socket.on('getInitRooms', () => { // cargar las salas iniciales activas
        socket.emit('setInitRooms', rooms)
    })

    socket.on('send', (data) => {
        let { text, nickname } = data;
        let message = {
            userId: socket.id,
            text,
            nickname
        }

        messages.push(message);
        io.emit('receive', message);
    });

    socket.on('getMessage', () => {
        socket.emit('setMessage', this.messages);
    });


    socket.on('setPing', (ping_time) => { // se activa en el servidor el evento on con nombre setPing enviado desde el cliente
        socket.emit('setPong', ping_time); // enviamos una respuesta al cliente con un nuevo nombre
    });

    // Rooms
    socket.on('getInitRooms', () => { // cargar las salas iniciales activas
        socket.emit('setInitRooms', rooms)
    })

    socket.on('newRoom', () => {
        // se genera un id único
        var newRoomId = shortid.generate();

        rooms.push({
            id: newRoomId, // se agrega la sala al arrglo de salas con el id generado y 
            players: [] // un array vacio para los jugadores de esa sala que se agregaran posteriormente
        });
        // se informan los cambios al cliente con el evento setNewRoom
        socket.emit('setNewRoom', { newRoomId, rooms });
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        users = users.filter(u => u.id !== socket.id);
        socket.emit('setUsers', users)
    });
});

app.get('/', (req, res) => {
    res.send('hi')
});

http.listen(3000, function() {
    console.log('Server started!');
});