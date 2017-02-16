var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    include = require('gulp-include'),
    injectSvg = require('gulp-inject-svg'),
    exec = require('child_process').exec,
    del = require('del'),
    browserSync = require('browser-sync').create();



gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        open: false,
        reloadDelay: 1000,
        notify: false
    });
});

gulp.task('injectSvg', ['images'], function() {
  return gulp.src('dist/**/*.html')
    .pipe(injectSvg())
    .pipe(gulp.dest('dist/'));
 
});

gulp.task('images', ['sculpin'], function () {
  return gulp.src(['source-assets/images/**/*', 'source-assets/liip-styleguide/dist/assets/toolkit/icons/icons.svg'])
    .pipe(gulp.dest('dist/assets/images/'))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
  return gulp.src('source-assets/liip-styleguide/dist/assets/toolkit/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts/'))
});


gulp.task('scripts', function () {
  return gulp.src('source-assets/scripts/rokka.js')
    .pipe(include()).on('error', gutil.log)
    .pipe(gutil.env.env === 'prod' ? uglify() : gutil.noop())
    .pipe(gulp.dest('dist/assets/scripts/'))
    .pipe(browserSync.stream());
});



gulp.task('cleanup', ['injectSvg'], function () {
  // return del([
  //   'output_en',
  //   'output_de'
  // ]);
});


gulp.task('styles', function () {
  return gulp.src('source-assets/styles/rokka.scss')
    .pipe(sass({
      includePaths: './'
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gutil.env.env === 'prod' ? cleancss() : gutil.noop())
    .pipe(gulp.dest('dist/assets/styles/'))
    .pipe(browserSync.stream());
});


// Generate HTML with Sculpin
gulp.task('sculpin', function (cb) {
  exec('vendor/sculpin/sculpin/bin/sculpin generate --env=en && vendor/sculpin/sculpin/bin/sculpin generate --env=de', function (err, stdout, stderr) {
    gutil.log(gutil.colors.cyan('Building pages with Sculpin\n\n') + stdout);
    gutil.log(gutil.colors.red(stderr));
    gutil.log(gutil.env.env);
    gulp.src('output_en/**/*').pipe(gulp.dest('dist/en'));
    gulp.src('output_de/**/*').pipe(gulp.dest('dist/de'))
    browserSync.reload();
    cb(err);
  });
})

gulp.task('setbuild', function () {
  gutil.env.env = 'prod';
});

// watch files
gulp.task('watch', function() {
  gulp.watch('source-assets/styles/**/*.scss', ['styles']);
  gulp.watch('source-assets/scripts/**/*.js', ['scripts']);
  gulp.watch('source-assets/liip-styleguide/dist/assets/toolkit/scripts/**/*.js', ['scripts']);
  gulp.watch('source-assets/liip-styleguide/dist/assets/toolkit/styles/**/*.css', ['styles']);
  gulp.watch('source/**/*', ['cleanup']);
  gulp.watch('app/config/**/*', ['cleanup']);
});

gulp.task('default', ['styles', 'scripts', 'watch', 'serve', 'fonts', 'cleanup']);
gulp.task('build', ['setbuild', 'styles', 'scripts', 'fonts', 'cleanup']);

