'use strict';

var gulp = require("gulp");
var sass = require("gulp-sass");
var gulpLoadPlugins = require("gulp-load-plugins");

gulp.task("porumai", function () {
    console.log('porumai!');
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