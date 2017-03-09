const gulp = require('gulp');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const uncss = require('gulp-uncss');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const svgmin = require('gulp-svgmin');
const include = require('gulp-include');
const injectSvg = require('gulp-inject-svg');
const runSequence = require('run-sequence');
const exec = require('child_process').exec;
const del = require('del');
const pump = require('pump');
const browserSync = require('browser-sync').create();

const config = require('./gulpconfig.js');



var env = 'local';


gulp.task('clean', () => {
  return del([config.dest])
});


gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: config.dest
        },
        open: false,
        reloadDelay: 1000,
        notify: false
    });

    gulp.watch('source-assets/styles/**/*.scss', ['compile:styles']);
    gulp.watch('source-assets/scripts/**/*.js', ['compile:scripts']);
    gulp.watch('source/**/*', ['compile:html']);
});


/*
  Clean up
 */

/*
  Assets
 */

gulp.task('copy:favicons', () => {
  return gulp.src('source-assets/favicons/**/*')
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
});


gulp.task('copy:fonts', () => {
  return gulp.src('source-assets/liip-styleguide/dist/assets/toolkit/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts/'));
});


gulp.task('copy:images', () => {
  return gulp.src([
      'source-assets/images/**/*',
      'source-assets/liip-styleguide/dist/assets/toolkit/icons/icons.svg'
    ])
    .pipe(gulp.dest('dist/assets/images/'))
    .pipe(browserSync.stream());
});


gulp.task('copy', ['copy:favicons', 'copy:fonts', 'copy:images']);


/*
  Compile styles, scripts and sculpin
 */

gulp.task('compile:styles', () => {
  return gulp.src(config.styles.src)
    .pipe(sass({
      includePaths: './'
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'ie >= 10'],
        cascade: false
    }))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(browserSync.stream());
});


gulp.task('compile:scripts', () => {
  return gulp.src(config.scripts.src)
    .pipe(include()).on('error', gutil.log)
    .pipe(gulp.dest(config.scripts.dest))
    .pipe(browserSync.stream());
});


gulp.task('compile:html', (cb) => {
  let count = 0;

  for (const lang of config.languages) {
    let sculpinEnv = env + '-' + lang;
    let sculpinCmd = 'vendor/sculpin/sculpin/bin/sculpin generate --env=' + sculpinEnv;

    exec(sculpinCmd, (err, stdout, stderr) => {
      gutil.log('Sculpin: ' + gutil.colors.cyan(sculpinEnv) + '\n\n' + stdout);
      gutil.log(gutil.colors.red(stderr));

      gulp.src('output_' + sculpinEnv + '/**/*')
          .pipe(gulp.dest(config.dest + lang))
          .on('end', () => {
            del('output_' + sculpinEnv);
          });

      count++;
      if (count == config.languages.length) {
        gulp.src('output_'+env+'-en/index.html').pipe(gulp.dest(config.dest));
        cb();
      }
    });
  }

})



gulp.task('compile', ['compile:styles', 'compile:scripts', 'compile:html']);



gulp.task('inject', () => {
  gulp.src('dist/**/*.svg')
    .pipe(svgmin({
        plugins: [{
          removeDoctype: false
        }, {
          cleanupIDs: false
        }]
    }))
    .pipe(gulp.dest(config.dest))
    .on('end', () => {
      return gulp.src('dist/**/*.html')
        .pipe(injectSvg())
        .pipe(gulp.dest(config.dest));
    })
});




gulp.task('minify:scripts', (cb) => {

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


gulp.task('minify:styles', () => {
  return gulp.src('dist/assets/styles/rokka.css')
    .pipe(uncss({
        html: ['dist/**/*.html'],
        ignore: [/language\-[\S]+/, /token[\S]+/, 'svg', '.logo', '.navbar'],
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


gulp.task('minify:html', () => {
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
    .pipe(gulp.dest(config.dest))
});


gulp.task('minify', ['minify:styles', 'minify:scripts', 'minify:html']);






gulp.task('build:stage', () => {
  env = 'stage';
  gulp.start('build');
});

gulp.task('build:prod', () => {
  env = 'prod';
  gulp.start('build');
});


gulp.task('build', ['clean'], () => {
  runSequence('compile', 'copy', 'inject', 'minify');
});

gulp.task('default', ['clean'], () => {
  runSequence('compile', 'copy', 'inject', 'serve');
});



