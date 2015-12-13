## 3 - chat

This final exercise puts several of the previous pieces together and goes back to the roots of using node as a web server while illustrating some more advanced concepts like how to use npm, and how a simple chat app can be easily put together using a library like socket.io.

It also introduces a very common usage of node - that of a task runner - in the form of writing a simple gulpfile for the project, to [transpile](https://en.wikipedia.org/wiki/Source-to-source_compiler) various static assets.

#### Creating a node project from scratch
This time around you'll be making a proper node app from scratch, the first thing to do is create an entry point for the app, so make a file called `index.js` in this folder.

Now open a command prompt and initialise a new node project in this folder using [`npm init`](https://docs.npmjs.com/cli/init).
```sh
npm init
```
Take the default answer for each of the questions it asks you, and you'll find it makes you a `package.json` file in this folder, now we can start work on the gulpfile.

#### Gulp and gulpfiles
Gulp is a task runner that runs on node (for more about gulp see [here](http://gulpjs.com/)), you compose the build steps you need using plain javascript in a build file (known as a gulpfile) which is, by convention, called `gulpfile.js` and placed in the root directory of your project.

To start writing our gulpfile we need to do three things
 - Make a file called `gulpfile.js` in the `3-chat` directory
 - Install gulp as a ***development dependency*** (using `--save-dev`), which both installs it and saves it to our `package.json` (as a way to persist our use of the package back into source control)
```sh
npm install gulp --save-dev
```
 - Globally install gulp on your machine (the `-g` means global) - this allows us to use the command `gulp` directly from any command prompt
```sh
npm install gulp -g
```

The skeleton of our gulpfile can now be written
```js
var gulp = require('gulp');

gulp.task('default', function() {
    console.log('Default task!');
});
```
This introduces the important function `gulp.task`, which is used to declare tasks which can be invoked by name using the `gulp` command in a command prompt (in this case we created the special, *default* task which is invoked when you don't supply a task name to the `gulp` command).

So, to see it in action, just run
```sh
gulp
```
from the `3-chat` directory and it'll log out "Default task!".

#### Adding a useful task
Now we'll make the first build task - *scripts*, which just copies the `js` files from `client/scripts` to `dist/scripts`.
```js
var gulp = require('gulp');

gulp.task('scripts', function() {
    return gulp.src('./client/scripts/**/*.js').
        pipe(gulp.dest('./dist'));
});

/* Default task ignored for now */
```
Here we see another key feature of gulp - that of a [*stream*](https://nodejs.org/api/stream.html) (specifically a [vinyl-fs](https://github.com/gulpjs/vinyl-fs) stream), created using `gulp.src` which is then `pipe`d through to an output, using `gulp.dest`.
> If the `**/*.js` syntax is unfamiliar to you, it's a *glob* expression and works like a simple form of regex for matching filepaths - see [here](https://github.com/isaacs/node-glob) for more info.

If you now run
```sh
gulp scripts
```
it won't quite do what it's supposed to - it'll copy the `js` files, but will omit the `scripts` folder, as it ignores the paths the files were found at relative to the root.

We can fix this by specifying a `base` for the src
```js
var gulp = require('gulp');

gulp.task('scripts', function() {
    return gulp.src('./client/scripts/**/*.js', {
            // Files will be copied to './dist' with their
            // path relative to './client'
            base: './client'
        }).
        pipe(gulp.dest('./dist'));
});

/* Default task ignored for now */
```

#### Transforming files
Gulp can be used simply for copying files, but it is more comonly used for *transforming* them in some way - concatenating, minifying, transpiling, etc. - which is done by `pipe`ing through plugins which transform the files along the way.

We'll now make a task which reads `styl` files ([*stylus*](https://learnboost.github.io/stylus/) - a language which transpiles to *css*) and outputs plain old `css` files, by `pipe`ing through the [`gulp-stylus`](https://github.com/stevelacy/gulp-stylus) plugin
```js
var gulp = require('gulp'),
    stylus = require('gulp-stylus');

gulp.task('styles', function() {
    return gulp.src('./client/styles/**/*.styl', {
            base: './client'
        }).
        pipe(stylus()).
        pipe(gulp.dest('./dist'));
});

/* Other tasks ignored */
```
This looks almost exactly the same as the `scripts` task - except we `pipe` it through `gulp-stylus` (transforming it from *stylus* to *css*) before `pipe`ing it out to its destination (using `gulp.dest`).

If you try to run `gulp styles` though it will fail since we haven't installed `gulp-stylus`, so lets do that now, along with a few other packages we need for our gulpfile (you can list any number of packages separated by spaces for `npm install`, likewise for several other `npm` commands)
```sh
npm install --save-dev gulp-stylus gulp-jade del run-sequence browser-sync
```
Once that completes you can test the task by running `gulp styles` which should output `main.css` to `dist/styles`.

#### Views and an overall build task
Next we'll add the task to turn our [`jade`](http://jade-lang.com/) view files into regular `html`, and then we'll connect all three of our tasks into a single build task
```js
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade');

gulp.task('views', function() {
    return gulp.src('./client/**/*.jade', {
            base: './client'
        }).
        pipe(jade()).
        pipe(gulp.dest('./dist'));
});

// You can specify an array of task names for a gulp.task to run
// In this case, 'build' runs our other three tasks
gulp.task('build', ['scripts', 'styles', 'views']);

/* Other tasks ignored */
```

#### Cleaning up after ourselves
When we rebuild the project we'll want to make sure we do it into a clean directory, so we'll add a cleanup task (and also re-do our default)
```js
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade'),
    runSequence = require('run-sequence'),
    del = require('del');

gulp.task('clean', function() {
    return del('./dist/**/*');
});

// The default task cleans THEN builds, the array syntax used for 'build'
// runs tasks in parallel, so we use 'run-sequence' to make them sequential
gulp.task('default', function(done) {
    runSequence('clean', 'build', done);
});

/* Other tasks ignored */
```

#### Watching files during development
The last thing we need to do is setup a development task which will watch our source files and rebuild things when needed (it'll also reload our browser for us, using [browser-sync](http://www.browsersync.io/), when needed)
```js
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade'),
    runSequence = require('run-sequence'),
    del = require('del'),
    browserSync = require('browser-sync');
// TODO: server = require('./server/index');

// The array means 'build' runs before 'dev' starts
gulp.task('dev', ['build'], function() {
    // TODO: Launch server on 8111: "server(8111);"
    // We init browser-sync to proxy our application
    browserSync.init({
        proxy: 'http://localhost:' + 8111
    });

    // Watch all files in 'client' ending with '.jade',
    // and run 'views' when any of them change
    gulp.watch('./client/**/*.jade', ['views']).
        // We can also listen for 'change' and run a browser reload
        on('change', browserSync.reload);

    gulp.watch('./client/scripts/**/*.js', ['scripts']).
        on('change', browserSync.reload);

    // Styles are different in that we can update them without
    // reloading the page, to do this we modify the task itself
    gulp.watch('./client/styles/**/*.styl', ['styles']);
});

gulp.task('styles', function() {
    return gulp.src('./client/styles/**/*.styl', {
            base: './client'
        }).
        pipe(stylus()).
        pipe(gulp.dest('./dist')).
        // This line triggers css-injection if browser-sync is running
        pipe(browserSync.stream());
});

/* Other tasks ignored */
```
We're done with the gulpfile for now, we'll see the finished product once we're able to deal with those `TODO`s a little later.

#### Creating an express web server
Our previous web server example was the ultra-basic 'hello world', which used only built-in modules to serve some plain test.  This time round we'll use [express](https://github.com/strongloop/express) to provide us a higher-level web server for serving some static content.

The first step is to install `express` and save it as a *(production)* ***dependency*** (using `--save`)
```sh
npm install express --save
```

Then we make our `server/index.js` file
```js
var http = require('http'),
    path = require('path'),
    express = require('express');

// This file exports a function which starts a server on the specified port
module.exports = function(port) {
    var app = express(),
        // We use 'http' to create a server which calls our express app
        // with each request
        server = http.createServer(app);

    // Make the server listen on the specified port
    server.listen(port, function () {
        console.log('Server listening at port %d', port);
    });

    // Use express to serve the files in '../dist'
    app.use(express.static(path.resolve(__dirname, '../dist')));
};
```
This example introduced another couple of the [global objects](https://nodejs.org/api/globals.html) present in node (a previously encountered one being `require`).

One was `module` - which can be used for exporting content from a file (*module*) using its `exports` property. The `exports` object is present in two forms - `module.exports` and also under the alias `exports`, which is a reference to `module.exports`.

We also made use of `__dirname`, which is the absolute path to the directory *this file is in* (there is a similar variable, `__filename`, which is the absolute filename).

An example of importing and exporting between files
```js
// file1.js

// Make sure we do 'exports =', else exports !== module.exports after
// the assignment
exports = module.exports = function() { return 'default export'; };

exports.a = function() { return 'a'; };
```

```js
// file2.js
var f1 = require('./file1');

f1(); // => default export
f1.a(); // => a
```

##### Running the server
If you now make another file, `index.js`, and put this in it
```js
// Launch a server on port 3001
require('./server/index')(3001);
```
You can run
```sh
node index.js
```
from command line and go to [http://localhost:3001](http://localhost:3001) to view the chat application (provided you ran `gulp` to build it).

#### Adding websockets
Currently, the application doesn't actually do anything, so lets install some packages that we can use to make a working chat app
```sh
npm install --save socket.io haikunator
```

We'll now update our app to include [`socket.io`](http://socket.io/), which allows us to communicate with clients using websockets
```js
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

    // Listen for websocket connections
    io.on('connection', function (socket) {
        // TODO: Do stuff with socket
    });
};
```

#### Making clients chat
Communicating between clients is made simple with the use of `socket.io`'s [`rooms`](http://socket.io/docs/rooms-and-namespaces/) feature
```js
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
        console.log('Client connected (username: %s)', username);

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
```

#### Finishing off the gulpfile
We can now complete the gulpfile to launch our server for us as part of the `dev` task
```js
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade'),
    runSequence = require('run-sequence'),
    del = require('del'),
    browserSync = require('browser-sync'),
    server = require('./server/index');

gulp.task('clean', function() {
    return del('./dist/**/*');
});

gulp.task('scripts', function() {
    return gulp.src('./client/scripts/**/*.js', {
            // Files will be copied to './dist' with their
            // path relative to './client'
            base: './client'
        }).
        pipe(gulp.dest('./dist'));
});

gulp.task('styles', function() {
    return gulp.src('./client/styles/**/*.styl', {
            base: './client'
        }).
        pipe(stylus()).
        pipe(gulp.dest('./dist')).
        // This line triggers css-injection if browser-sync is running
        pipe(browserSync.stream());
});

gulp.task('views', function() {
    return gulp.src('./client/**/*.jade', {
            base: './client'
        }).
        pipe(jade()).
        pipe(gulp.dest('./dist'));
});

// You can specify an array of tasks for a gulp task to run
// In this case, 'build' runs our other three tasks
gulp.task('build', ['scripts', 'styles', 'views']);

// The array means 'build' runs before 'dev' starts
gulp.task('dev', ['build'], function() {
    // Launch our server on port 8111
    server(8111);

    // We init browser-sync to proxy our application
    browserSync.init({
        proxy: 'http://localhost:' + 8111
    });

    // Watch all files in 'client' ending with 'jade',
    // and run 'views' when any of them change
    gulp.watch('./client/**/*.jade', ['views']).
        // We can also listen for 'change' and run a browser reload
        on('change', browserSync.reload);

    gulp.watch('./client/scripts/**/*.js', ['scripts']).
        on('change', browserSync.reload);

    // Styles are different in that we can update them without
    // reloading the page, to do this we modify the task itself
    gulp.watch('./client/styles/**/*.styl', ['styles']);
});

// The default task cleans THEN builds, the array syntax used for 'build'
// runs tasks in parallel, so we use 'run-sequence' to make them sequential
gulp.task('default', function(done) {
    runSequence('clean', 'build', done);
});
```

Running
```sh
gulp dev
```
will cause `browser-sync` to open [http://localhost:3000](http://localhost:3000) (*browser-sync's proxy runs on port 3000*) in your default browser, where you should find a working chat app - open up a couple of tabs and try chatting.

If you change any of the source files in `/client`, you should see they get automatically rebuilt, and your browser refreshed, as required based on what changed
