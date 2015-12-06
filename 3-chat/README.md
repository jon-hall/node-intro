## 3 - chat

This final exercise puts several of the previous pieces together and goes back to the roots of using node as a web server while illustrating some more advanced concepts like how to use npm, and how a simple chat app can be easily put together using a library like socket.io.

It also introduces a very common usage of node - that of a task runner - in the form of writing a simple gulpfile for the project, to transpile various static assets.

#### Creating a node project from scratch
This time around you'll be making a proper node app from scratch, the first thing to do is create an entry point for the app, so make a file called `index.js` in this folder.

Now open a command prompt, in this folder, and initialise a new node project using.
```sh
npm init
```
Take the default answer for each of the questions it asks you, and you'll find it makes you a `package.json` file in this folder, now we can start work on the gulpfile.

#### Gulp and gulpfiles
Gulp is a task runner that runs on node, you compose the build steps you need using plain javascript in a build file (known as a gulpfile) which is, by convention, called `gulpfile.js` and placed in the root directory of your project.

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
To see it in action just run
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
Gulp can be used simply for copying files, but it is more comonly used for *transforming* them in some way - concatenating, minifying, transpiling, etc. - which is done using `pipe`.

We'll now make a task which reads `styl` files (*stylus* - a language which transpiles to *css*) and outputs plain old `css` files
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

If you try to run `gulp styles` though it will fail since we haven't installed `gulp-stylus`, so lets do that now, along with a few other packages we need for our gulpfile (you can list any number of packages separated by spaces)
```sh
npm install --save-dev gulp-stylus gulp-jade del run-sequence browser-sync
```
Once that completes you can test the task by running `gulp styles` which should output `main.css` to `dist/styles`.

#### Views and an overall build task
Next we'll add the task to turn our `jade` view files into regular `html`, and then we'll connect all three of our tasks into a single build task
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

// You can specify an array of tasks for a gulp task to run
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
    return del('./dist/**/*'));
});

// The default task cleans THEN builds, the array syntax used for 'build'
// runs tasks in parralel, so we use 'run-sequence' to make them sequential
gulp.task('default', function(done) {
    runSequence('clean', 'build', done);
});

/* Other tasks ignored */
```

#### Watching files during development
The last thing we need to do is setup a development task which will watch our source files and rebuild things when needed (it'll also reload our browser for us, if need be)
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
    // TODO: Launch server on 8111: "server({ port: 8111 });"
    // We init browser-sync to proxy our application
    browserSync.init({
        proxy: 8111
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

#### Socket.io chat server

> TODO

#### Gulp watch tasks

> TODO
