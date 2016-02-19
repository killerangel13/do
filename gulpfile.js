'use strict';

var fs = require('fs'),
	pkg = require('./package.json'),
	gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	header = require('gulp-header'),
	rename = require('gulp-rename'),
	log = require('gulp-util');


function build(src, dest, name) {
	gulp.src(src)
		.pipe(uglify({ mangle: true, output: { ascii_only: true } }))
		.pipe(header(fs.readFileSync('./header.txt', 'utf8'), pkg))
		.pipe(rename(name))
		.pipe(gulp.dest(dest))
		.on('error', log.log);
}

gulp.task('build', function() {
	build('./do.js', './', 'do.min.js');
});