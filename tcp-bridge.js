//client side
const { io } = require("socket.io-client");
let socketIo = io.connect('http://localhost:3000', { reconnect: true });
let connectionReady = false;


// Include Nodejs' net module.
const Net = require('net');

// The port on which the server is listening.
const port = 10000;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.createServer();


// Add a connect listener
socketIo.on('connect', function (socket) {
    console.log('Connected!');
});

socketIo.on('event', function (scope, event, data) {
    console.log(`received event: ${scope} ${event} ${JSON.stringify(data)}`);
    server.emit('event-croquet', scope, event, data);
});

socketIo.on('data', function (chunk) {
    console.log(`received data from socketIo server: ${JSON.stringify(chunk)}`);
    //server.emit('data-croquet', chunk);

});

socketIo.on('data-update', function (chunk) {
    console.log(`received data update from socketIo server: ${JSON.stringify(chunk)}`);
    //server.emit('data-update-croquet', chunk);
});

socketIo.on("connection-ready", function (chunk) {
    
    console.log(`received connection-ready from socketIo server`)
    connectionReady = true;
});

socketIo.on('ready', function (chunk) {
    console.log('Received Ready');
    server.emit('ready');
});

socketIo.on('data', function (chunk) {
    console.log(`received DATA update from socketIo server: ${JSON.stringify(chunk)}`);
});



// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(port, () => {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
    
    
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    if (connectionReady) {
        console.log('Connection ready');
        socket.write(JSON.stringify({ action: 'connection-ready' }) + "\n");

    }
   
    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    
    

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function (chunk) {
        //console.log(`Data received from client: ${chunk.toString()}`);
        //use jsonschema
        let splitString = chunk.toString().split('\n');
        splitString.forEach((val) => {
            if (val !== '') {
                    try{
                    console.log(val);

                    obj = JSON.parse(val);
                    

                    switch (obj.action) {
                        case 'subscribe':
                            console.log('subscribe');
                            socketIo.emit('subscribe', scope = obj.scope.trim(), event = obj.event.trim());
                            break;
                        case 'publish':
                            console.log('publish');
                            socketIo.emit('publish', scope = obj.scope.trim(), event = obj.event.trim(), data = obj.data);
                            break;
                        case 'join':
                            console.log('join');
                            socketIo.emit('join');
                            break;




                    }
                }catch(e){}
            }

        });

        

    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${ err }`);
    });

    server.on('ready', function () {
        socket.write(JSON.stringify({ action: 'ready' }) + "\n");

    });

    server.on('data-croquet', function (chunk) {
        socket.write(JSON.stringify({ action: 'data', data: chunk }) + "\n");

    });

    server.on('event-croquet', function (scopeVal, eventVal, dataVal) {
        socket.write(JSON.stringify({ action: 'event', scope: scopeVal, eventName : eventVal, data : dataVal })+"\n");

    });

    server.on('data-update-croquet', function (chunk) {
        //socket.write(JSON.stringify({ action: 'data-update', data: chunk }));
    });
    
});

