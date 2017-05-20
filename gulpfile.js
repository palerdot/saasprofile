'use strict';

var gulp = require("gulp");
var sass = require("gulp-sass");
var gulpLoadPlugins = require("gulp-load-plugins");

// dynamically load gulp plugins
var $ = gulpLoadPlugins();

// flag to track if we are building production build;
var IS_PRODUCTION = false;

// overall watch task
gulp.task("watch", ["dev", "js:watch", "scss:watch", "json:watch"]);

// minify js files from "scripts" to "js"
gulp.task("js", function () {

    var uglify_options = { compress: { drop_console: IS_PRODUCTION } };

    return gulp.src("./scripts/**/*.js")
                .pipe( $.sourcemaps.init() )
                .pipe( $.uglify( uglify_options ) )
                .pipe( $.sourcemaps.write(".") )
                .pipe( gulp.dest("./js") );
});

// watch js files
gulp.task("js:watch", function () {
    gulp.watch("./scripts/**/*.js", ["js"]);
});

// minify json files
gulp.task("json", function () {
    return gulp.src("./data-src/**/*.json")
                .pipe( $.jsonminify() )
                .pipe( gulp.dest("./data") )
});

// watch json files change
gulp.task("json:watch", function () {
    gulp.watch("./data-src/**/*.json", ["json"])
});

// convert scss to css
gulp.task("scss", function () {
    return gulp.src("./styles.scss/**/*.scss")
                // pipe the scss files and convert it to compressed css files
                .pipe( sass({ outputStyle: "compressed" }).on("error", sass.logError) )
                .pipe( gulp.dest("./css") );
});

// watch scss file change and build css files automatically
gulp.task("scss:watch", function () {
    gulp.watch("./styles.scss/**/*.scss", ["scss"]);
});

// change the setting for prod
gulp.task("prod", function () {
    IS_PRODUCTION = true;
});

// change the setting for dev
gulp.task("dev", function () {
    IS_PRODUCTION = false;
});

// build package for production
gulp.task("build-prod", ["prod", "js", "json", "scss"]);

