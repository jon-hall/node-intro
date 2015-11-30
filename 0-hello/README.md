## 0 - hello

This example is the canonical node "hello world" exercise, and forms an introduction to some of the basic concepts for working with node.

#### Install node
The first thing to do is install node 4.x if you don't yet have it - get it [here](https://nodejs.org).

#### Make an entry point
The next thing is to make our entry point - `index.js` - this is the file we will run using node, and will be where all of the code goes in this simple example.

#### Requiring modules
So, we have an empty `index.js` file, now we need to write some code that makes it **do** something - the first step in that is almost always by `require`ing some modules which provide functionality we can use.

In this case we require one of the many modules that is built-in to node, [`http`](https://nodejs.org/api/http.html), (see the rest [here](https://nodejs.org/api/)).
```js
var http = require('http');
```
What `require` does is tells node to (*synchronously*) load the `http` module and return it to us, so we can store it in the variable `http`.

> Later we'll go over how you do the opposite of `require`ing - `export`ing functionality for other files (or even packages) to use.

#### Creating a server
Now we have the `http` module loaded we can use it to make ourselves a basic web-server!
```js
var http = require('http');

var server = http.createServer(function(request, response) {
    // TODO
});
```
The only thing we need to pass it is a callback, which will receive incoming `request`s and let us send them a `response`, but currently the callback we supplied doesn't do anything.

#### Responding to requests
Lets send the client a response whenever we get a request.
```js
var http = require('http');

var server = http.createServer(function(request, response) {
    // Send back an OK status code (200) and tell them we're sending plain text
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    // Then finalize the response with a string using response.end()
    response.end('Hello from node!');
});
```

#### Listening
The last thing our web server needs is to *listen for requests*.
```js
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
```
We now have a fully functioning "Hello world" server!

#### Running node applications
To run the application you just have to enter (*in a command prompt*).
```sh
node index.js
```
It should then log out that it is listening (or any errors if something went wrong), and you can open http://localhost:3000/ to view the response it sends.
