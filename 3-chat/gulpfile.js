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
