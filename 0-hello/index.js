var http = require('http');

var server = http.createServer(function(request, response) {
    // Send back an OK status code (200) and tell them we're sending plain text
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    // Then finalize the response with a string using response.end()
    response.end('Hello from node!');
});

server.listen(3000, function() {
    console.log('Now listening on port 3000...');
});
