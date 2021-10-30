//STEP 2.
//express
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//Server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server is listening at: " + port);
});

//STEP 3. socket connection
let io = require('socket.io');
io = new io.Server(server);
let private = io.of('/private');

/*PUBLIC DEFAULT NAMESPACE */
io.sockets.on('connection', (socket) => {
  console.log("We have a new client: " + socket.id);

  //STEP 6. Listen for data
  socket.on("data", (data) =>{
    console.log(data);

    //send to all clients, including myself
    io.sockets.emit('draw-data', data);
  });

  socket.on('disconnect', () =>{
    console.log('Client disconnected: ' + socket.id);
  });
});

/*PRIVATE NAMESPACE */
private.on('connection', (socket) => {
  console.log("We have a new client: " + socket.id);

  socket.on('room-name', (data)=>{
    console.log(data);
    //add socket to room - joins or creates a new one
    socket.join(data.room);
    //add room property to the socket, so it's available on other events
    socket.room = data.room;

    //send a welcome message
    let welcomeMsg = "Welcome to '" + data.room + "' room!";
    //send a welcome message to all in the room on each new user joining
    // private.to(socket.room).emit('joined', {msg: welcomeMsg});
    //send a welcome message only to the client that joined
    socket.emit('joined', {msg: welcomeMsg});
  });

  //STEP 6. Listen for data
  socket.on("data", (data) =>{
    console.log(data);

    //send to all clients, including myself
    private.to(socket.room).emit('draw-data', data);
  });

  socket.on('disconnect', () =>{
    //leave room on disconnecting
    console.log('Client ' + socket.id + ' disconnected and left room: ' + socket.room);
    // console.log('Client disconnected: ' + socket.id);
    socket.leave(socket.room);
  });
});
