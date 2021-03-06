// Gulp variables set
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee');
    browserify = require('gulp-browserify');
    compass = require('gulp-compass');
    connect = require('gulp-connect');
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    jsonminify = require('gulp-jsonminify'),
    concat = require('gulp-concat');

// Enviorment variables set
var env,
    coffeeSources,
    jsSources,
    sassSources,
    htmlSources,
    jsonSources,
    outputDir,
    sassStyle;

// Enviorment NODE_ENV is production or development
env = process.env.NODE_ENV || 'development';

if (env==='development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
    gutil.log('in development enviorment');
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
    gutil.log('in production enviorment');
}

coffeeSources = ['components/coffee/tagline.coffee'];
jsSources = [
    'components/scripts/rclick.js',
    'components/scripts/pixgrid.js',
    'components/scripts/tagline.js',
    'components/scripts/template.js'
];
sassSources = ['components/sass/style.scss']
htmlSources = [outputDir + '*.html']
jsonSources = [outputDir + 'js/*.json']

gulp.task('coffee', function() {
    gulp.src(coffeeSources) // Get source files with gulp.src variable above
        .pipe(coffee({ bare: true }) // Sends it through a gulp plugin
            .on('error', gutil.log)) // on error log the error
        .pipe(gulp.dest('components/scripts')) // Outputs the file in the destination folder
});

gulp.task('js', function() {
    gulp.src(jsSources) // Get source files with gulp.src variable above
        .pipe(concat('script.js')) // Sends it through a gulp plugin
        .pipe(browserify()) // Run browserify
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js')) // Outputs the file in the destination folder
        .pipe(connect.reload()) // Run connect task and reload page
});

gulp.task('compass', function() {
    gulp.src(sassSources) // Get source files with gulp.src variable above
        .pipe(compass({
            sass: 'components/sass', // Compress all sass files from this directory
            image: outputDir + 'images', // outputDir variable path set from enviorment variables
            debug: true, // Debug if there is an issue
            sourcemap: true, // Sourcemap for SASS
            style: sassStyle // Variable set from enviorment variables above
        }) // Sends it through a gulp plugin
        .on('error', gutil.log)) // Log something on error
        .pipe(gulp.dest(outputDir + 'css')) // Outputs the file in the destination folder
        .pipe(connect.reload()) // Run connect task and reload page
});

gulp.task('watch', function() {
    gulp.watch(coffeeSources, ['coffee']) // Monitor these files
    gulp.watch(jsSources, ['js']) // Monitor these files
    gulp.watch('components/sass/*.scss', ['compass']) // Monitor these files
    gulp.watch('builds/development/*.html', ['html']); // Monitor these files
    gulp.watch('builds/development/*.json', ['json']); // Monitor these files
    gulp.watch('builds/development/images/**/*.*', ['images']); // Monitor these files
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir, // root is outputDir a variable up top based on enviorment
        livereload: true // turn livereload on
    }); // connect to server and set livereload work
});

gulp.task('html', function() {
    gulp.src('builds/development/*.html') // Get source files with gulp.src variable above
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload()) // Run connect task and reload page
});

gulp.task('images', function() {
    gulp.src('builds/development/images/**/*.*') // Get source files with gulp.src
        .pipe(gulpif(env === 'production', imagemin({ // if env is production run imagemin gulp plugin
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngcrush()]
        })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir +'images')))
        .pipe(connect.reload()) // Run connect task and reload page
});

gulp.task('json', function() {
    gulp.src('builds/development/js/*.json') // Get source files with gulp.src variable above
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload()) // Run connect task and reload page
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);
