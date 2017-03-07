var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    htmlmin = require('gulp-htmlmin'),
    include = require('gulp-include'),
    injectSvg = require('gulp-inject-svg'),
    exec = require('child_process').exec,
    del = require('del'),
    pump = require('pump'),
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

gulp.task('favicons', ['images'], function () {
  return gulp.src('source-assets/favicons/**/*')
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

gulp.task('injectSvg', ['favicons'], function() {
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
  return gulp.src('source-assets/scripts/*.js')
    .pipe(include()).on('error', gutil.log)
    .pipe(gulp.dest('dist/assets/scripts/'))
    .pipe(browserSync.stream());
});


gulp.task('styles', function () {
  return gulp.src('source-assets/styles/rokka.scss')
    .pipe(sass({
      includePaths: './'
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'ie >= 10'],
        cascade: false
    }))
    .pipe(gulp.dest('dist/assets/styles/'))
    .pipe(browserSync.stream());
});






gulp.task('minify:scripts', ['sculpin', 'scripts'], function (cb) {

  pump([
      gulp.src('dist/assets/scripts/*.js'),
      uglify({
        mangle: {
          toplevel: true
        },
        compress: {
          dead_code: true,
          collapse_vars: true,
          reduce_vars: true,
          drop_console: true
        }
      }),
      gulp.dest('dist/assets/scripts/')
    ],
    cb
  );
});


gulp.task('minify:styles', ['styles', 'sculpin', 'scripts'] , function () {
  return gulp.src('dist/assets/styles/rokka.css')
    .pipe(uncss({
        html: ['dist/**/*.html'],
        ignore: [/language\-[\S]+/, /token[\S]+/],
        timeout: 1000
    }))
    .pipe(cleancss({
      level: {
        1: {
          specialComments: 0
        },
        2: {
          all: true
        }
      }
    }))
    .pipe(gulp.dest('dist/assets/styles/'))
});


gulp.task('minify:html', ['minify:styles', 'minify:scripts'] , function () {
  return gulp.src('dist/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true,
      sortAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist/'))
});


// Generate HTML with Sculpin
gulp.task('sculpin', function (cb) {
  exec('vendor/sculpin/sculpin/bin/sculpin generate --env=en && vendor/sculpin/sculpin/bin/sculpin generate --env=de', function (err, stdout, stderr) {
    gutil.log(gutil.colors.cyan('Building pages with Sculpin\n\n') + stdout);
    gutil.log(gutil.colors.red(stderr));
    gutil.log(gutil.env.env);
    gulp.src('output_en/**/*').pipe(gulp.dest('dist/en'));
    gulp.src('output_de/**/*').pipe(gulp.dest('dist/de'))
    gulp.src('output_en/index.html').pipe(gulp.dest('dist/'));
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
  gulp.watch('source/**/*', ['injectSvg']);
  // gulp.watch('app/config/**/*', ['cleanup']);
});

gulp.task('default', ['styles', 'scripts', 'watch', 'serve', 'fonts', 'injectSvg']);
gulp.task('build', ['setbuild', 'minify:styles', 'minify:scripts', 'minify:html', 'fonts', 'injectSvg']);

