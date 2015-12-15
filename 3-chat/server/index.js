var http = require('http'),
    path = require('path'),
    express = require('express'),
    socketio = require('socket.io'),
    haikunate = require('haikunator');

// This file exports a function which starts a server on the specified port
module.exports = function(port) {
    var app = express(),
        // We use 'http' to create a server which calls our express app
        // with each request
        server = http.createServer(app),
        // We can re-use the server to also receive websocket connections
        // through it, using socket.io
        io = socketio(server);

    // Make the server listen on the specified port
    server.listen(port, function () {
        console.log('Server listening at port %d', port);
    });

    // Use express to serve the files in '../dist'
    app.use(express.static(path.resolve(__dirname, '../dist')));

    io.on('connection', function (socket) {
        // First thing we do is generate a random username for all connections
        var username = haikunate();

        // Log that we got a new connection
        console.log('Client connected (pid: %d)', process.pid);

        // Make the connection join the 'main' room
        socket.join('main');

        // Tell the new client what their username is
        socket.emit('username', username);

        // Let everyone else in the room know a new user has joined
        socket.to('main').emit('in', username);

        // When we receive a message from this client
        socket.on('msg', function (msg) {
            // Echo it to everyone else in the 'main' room
            socket.to('main').emit('msg', { username, msg });
        });

        // Finally, when this client disconnects
        socket.on('disconnect', function () {
            // Tell everyone still in the room about it
            socket.to('main').emit('out', username);
        });
    });
};
