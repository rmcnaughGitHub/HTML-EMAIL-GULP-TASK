'use strict';

var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),//https://www.npmjs.org/package/gulp-autoprefixer
	sass = require('gulp-sass'),//sass compiler
	browserSync = require('browser-sync').create(),
	imagemin = require('gulp-imagemin'),//https://www.npmjs.com/package/gulp-imagemin
	pngquant = require('imagemin-pngquant'),//pngquant enabled saves extra bytes on PNG files
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence'),
	concat = require('gulp-concat'),//cocatenate files
	inline = require('gulp-mc-inline-css'),//makes css inline
	/* The gulp task system provides a gulp task 
	with a callback, which can signal successful
	task completion (being called with no arguments),
	or a task failure (being called with an Error 
	argument). Fortunately, this is the exact same format pump uses!*/
	pump = require('pump');


//PATHS
var paths = {
	base: {
		src: './app',
		html: 'app/*.html',
		css: 'app/css/*.css',
		js: 'js/*.js',
		dist: 'dist'
	}, 
	html: {
		src: 'app/*.html',
		main: './',
		dist: 'dist'
	},
	styles: {
		src: 'app/scss/**/*.scss',
		main: 'app/css',
		dist: 'dist/css'
	},
	images: {
		src: 'app/images/*',
		main: 'app/images',
		dist: 'dist/images'
	}
};


//HTML COPY - used if compying to another directory
gulp.task('copy-html', function(){
	gulp.src(paths.html.src)
	.pipe(gulp.dest(paths.html.dist))
});

//SASS
// Because Browsersync only cares 
// about your CSS when it's finished compiling
// - make sure you call .stream() after gulp.dest
gulp.task('sass', function() {  
    gulp.src(paths.styles.src)
        .pipe(sass({includePaths: ['scss'], style: 'expanded' }))
        .pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
		.pipe(gulp.dest(paths.styles.main))//app folder
		.pipe(browserSync.stream())
});

gulp.task('sass-build', function() {  
    gulp.src(paths.styles.src)
        .pipe(sass({includePaths: ['scss'], style: 'expanded' }))
        .pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
        .pipe(concat('styles.css'))
		.pipe(minifycss()) //*minify
		.pipe(gulp.dest(paths.styles.dist));//dist folder
});

gulp.task('css-inline', function(){
	gulp.src(paths.styles.main)
		.pipe(inline(APIKEY))
		.pipe(gulp.dest(paths.html.src))
});

//BROWSER SYNC - LIVE RE-LOAD
// ***can use 'serve' where 'browser-sync' is used***
gulp.task('browser-sync', function() {  
    browserSync.init([paths.base.css, paths.base.js], {
        server: {
            baseDir: paths.base.src
        }
    });
});



//IMAGE-MINIFY
gulp.task('imageMin', function () {
    gulp.src(paths.images.src)
        .pipe( cache(imagemin({
        	optimizationLevel: 6, 
        	progressive: true,
        	use: [pngquant()], 
        	interlaced: true
        })) )
  		.pipe(gulp.dest(paths.images.dist));
});


//CLEAN DIST FOLDER
gulp.task('clean:dist', function() {
  return del.sync(paths.base.dist);
})


//WATCH
gulp.task('watch', function() { 
	gulp.watch(paths.styles.src, ['sass']);// sass
	gulp.watch(paths.styles.src).on('change', browserSync.reload);//sass
	gulp.watch(paths.base.html).on('change', browserSync.reload);//html
	gulp.watch(paths.html.src).on('change', browserSync.reload);//inline styles
	gulp.watch(paths.images.src,['imageMin']);//imageMin
});


//DEFAULT TASKS
gulp.task('default', function() { 
	runSequence('watch',['sass', 'browser-sync']); 
});


//BUILD TASK
gulp.task('build', function(){
	runSequence('clean:dist',['sass-build','copy-html','imageMin']);
});
