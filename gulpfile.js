var gulp 	    	= require('gulp'),
		prefixer  	= require('gulp-autoprefixer'),
		sass 	    	= require('gulp-sass'),
		rigger      = require('gulp-rigger'),
		watch       = require('gulp-watch'),
		rimraf      = require('rimraf'),
		browserSync = require('browser-sync'),
		plumber 		= require('gulp-plumber'),
    spritesmith = require('gulp.spritesmith'),
    merge       = require('merge-stream'),
    gm          = require('gulp-gm'),
    resizer     = require('gulp-image-resize'),
    rename      = require('gulp-rename'),
		reload 			= browserSync.reload;

var projectName = 'redsoft';
var path = {
			build: {
				html: projectName + '/',
				js: projectName + '/js/',
				css: projectName + '/css/',
				img: projectName + '/img/',
        sprite: projectName + '/sprites/',
				fonts: projectName + '/fonts/'
			},
			src: {
				html: 'src/*.html',
				js: 'src/js/*.js',
				sass: 'src/style/*.scss',
        css: 'src/style/*.css',
				img: 'src/img/**/*.*',
        sprites: 'src/sprites/**/*.*',
				fonts: 'src/fonts/**/*.*'
			},
			watch: {
				html: 'src/**/*.html',
				js: 'src/js/**/*.js',
				style: 'src/style/**/*.*',
				img: 'src/img/**/*.*',
        sprites: 'src/sprites/**/*.*',
				fonts: 'src/fonts/**/*.*'
			},
			clear: './build'
};
var config = {
	server: {
		baseDir: "./" + projectName
	},
	host: 'localhost',
	port: 9000,
	browser: 'chrome',
	logPrefix: "Frontend_BerTepesh"
};

gulp.task('html:build', ()=> {
  return gulp.src(path.src.html)
		.pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});
gulp.task('js:build', ()=> {
  return gulp.src(path.src.js)
		.pipe(plumber())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});
gulp.task('scale', ()=> {
	return gulp.src('src/sprites/*.*')
		.pipe(plumber())
		.pipe(resizer({
			percentage: 200,
      sharpen: true
		}))
		.pipe(rename(function (path) { path.basename += "@2x"; }))
		.pipe(gulp.dest('src/sprites/2x'))
});
gulp.task('sprite', ()=> {
  var spriteData = gulp.src('src/sprites/**/*.*')
		.pipe(plumber())
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '/img/sprite.png',
      cssName: 'sprite.scss',
      retinaSrcFilter: 'src/sprites/2x/*@2x.png',
      retinaImgName: 'sprite@2x.png',
      retinaImgPath: '/img/sprite@2x.png',
      padding: 5
    }));
  var imgStream = spriteData.img
    .pipe(gulp.dest(path.build.img));

  var cssStream = spriteData.css
    .pipe(gulp.dest('src/style/part'))
    .pipe(reload({stream: true}));
  return merge(imgStream, cssStream);
});

gulp.task('fonts:build', () => {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});
gulp.task('css:build', ()=> {
  return gulp.src(path.src.css)
		.pipe(plumber())
    .pipe(prefixer())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});
gulp.task('sass:build', ()=> {
  return gulp.src(path.src.sass)
		.pipe(plumber())
    .pipe(sass())
    .pipe(prefixer())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});
gulp.task('image:build', ()=> {
  return gulp.src(path.src.img)
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});
gulp.task('build', gulp.series(
  'html:build',
  'js:build',
	'scale',
  'sprite',
  'css:build',
  'sass:build',
  'fonts:build',
  'image:build'
));
gulp.task('watch', () => {
  watch(path.watch.html, gulp.parallel('html:build'));
  watch(path.watch.sprites, gulp.parallel('sprite'));
  watch(path.watch.style, gulp.parallel('css:build', 'sass:build'));
  watch(path.watch.js, gulp.parallel('js:build'));
  watch(path.watch.img, gulp.parallel('image:build'));
  watch(path.watch.fonts, gulp.parallel('fonts:build'));
});
gulp.task('webserver', () => {return browserSync(config)});
gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});
gulp.task('default', gulp.parallel('build', 'webserver', 'watch'));