// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var rimraf = require('gulp-rimraf');
var jshint = require('gulp-jshint');
var closure = require('gulp-closure-compiler');
var browserify = require('gulp-browserify');
var jsdoc = require('gulp-jsdoc');
var generateSuite = require("gulp-mocha-browserify-suite");
var mocha = require("gulp-mocha");

// Lint
gulp.task('lint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('check', function(){
    // Perform type checking, etc. with closure compiler
    gulp.src('build/colour.js')
        .pipe(closure({
            compilerPath: '/usr/share/java/closure-compiler/closure-compiler.jar',
            fileName: 'colour.min.js',
            compilerFlags: {
                warning_level: 'VERBOSE',
                summary_detail_level: 1
            }
        }))
});

// Compress/minify
gulp.task('compress', function(){
    gulp.src('build/colour.js')
        .pipe(closure({
            compilerPath: '/usr/share/java/closure-compiler/closure-compiler.jar',
            fileName: 'colour.min.js',
            compilerFlags: {
                warning_level: 'QUIET',
                compilation_level: 'SIMPLE_OPTIMIZATIONS'
            }
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('browserify', function() {
    gulp.src('src/colour.js')
        .pipe(browserify({
            standalone: 'Colour'
        }))
        .pipe(gulp.dest('build'));
});

// Build documentation
gulp.task('docs', ['cleandocs'], function() {
    gulp.src('src/**/*.js')
        .pipe(jsdoc('docs'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.{js,html}', ['lint', 'browserify']);
});

gulp.task('cleantests', function() {
  return gulp.src('tests/build/suite.js', { read: false }) // much faster
    .pipe(rimraf());
});

gulp.task('cleandocs', function() {
  return gulp.src('docs/*', { read: false }) // much faster
    .pipe(rimraf());
});

gulp.task('browserify-tests', ['cleantests'], function() {
    return gulp.src('tests/**/*.js')
        .pipe(generateSuite())
        .pipe(browserify({
            standalone: 'tests',
            debug: true
        }))
        .pipe(gulp.dest('tests/build'));
});

gulp.task('mocha', ['browserify-tests'], function() {
    return gulp.src('tests/build/suite.js').pipe(mocha({reporter: 'min', ui: 'tdd'}));
});

// Default Task
gulp.task('default', ['lint', 'browserify', 'watch']);
gulp.task('compile', ['browserify', 'compress']);
gulp.task('check', ['lint', 'browserify', 'check']);
gulp.task('test', function(){
    gulp.watch(['src/**/*.js', 'tests/**/*.js', '!tests/build/*'], ['mocha']);
});