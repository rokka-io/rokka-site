var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    include = require('gulp-include'),
    injectSvg = require('gulp-inject-svg'),
    exec = require('child_process').exec,
    browserSync = require('browser-sync').create();



gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./output_dev"
        },
        open: false,
        reloadDelay: 1000
    });
});

gulp.task('injectSvg', ['sculpin'], function() {
  return gulp.src('output_dev/**/*.html')
    .pipe(injectSvg())
    .pipe(gulp.dest('output_dev/'));
 
});

gulp.task('images', function () {
  return gulp.src(['source-assets/images/**/*', 'source-assets/liip-styleguide/dist/assets/toolkit/icons/icons.svg'])
    .pipe(gulp.dest('output_dev/assets/images/'))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
  return gulp.src('source-assets/liip-styleguide/dist/assets/toolkit/fonts/**/*')
    .pipe(gulp.dest('output_dev/assets/fonts/'))
});


gulp.task('scripts', function () {
  return gulp.src('source-assets/scripts/rokka.js')
    .pipe(include()).on('error', gutil.log)
    .pipe(gulp.dest('output_dev/assets/scripts/'))
    .pipe(browserSync.stream());
});



gulp.task('styles', function () {
  return gulp.src('source-assets/styles/rokka.scss')
    .pipe(sass())
    .pipe(gulp.dest('output_dev/assets/styles/'))
    .pipe(browserSync.stream());
});


// Generate HTML with Sculpin
gulp.task('sculpin', function (cb) {
  exec('vendor/sculpin/sculpin/bin/sculpin generate', function (err, stdout, stderr) {
    gutil.log(gutil.colors.cyan('Building pages with Sculpin\n\n') + stdout);
    gutil.log(gutil.colors.red(stderr));
    cb(err);
    browserSync.reload();
  });
})

// watch files
gulp.task('watch', function() {
  gulp.watch('source-assets/styles/**/*.scss', ['styles']);
  gulp.watch('source-assets/scripts/**/*.js', ['scripts']);
  gulp.watch('source-assets/liip-styleguide/dist/assets/toolkit/scripts/**/*.js', ['scripts']);
  gulp.watch('source-assets/liip-styleguide/dist/assets/toolkit/styles/**/*.css', ['styles']);
  gulp.watch('source/**/*', ['injectSvg']);
});

gulp.task('default', ['styles', 'watch', 'injectSvg', 'serve', 'scripts', 'fonts', 'images']);

// const path = require('path');
// const fs = require('fs');
// const gulp = require('gulp');
// const $ = require('gulp-load-plugins')();
// const runSequence = require('run-sequence');
// const webpack = require('webpack');
// const autoprefixer = require('autoprefixer');
// const config = require('./config.js');

// const reload = browserSync.reload;


// // clean
// gulp.task('clean', del.bind(null, [config.dest]));


// // styles
// gulp.task('styles:fabricator', () => {
//   gulp.src(config.styles.fabricator.src)
//   .pipe($.sourcemaps.init())
//   .pipe($.sass().on('error', $.sass.logError))
//   .pipe($.postcss([autoprefixer()]))
//   .pipe($.if(!config.dev, csso()))
//   .pipe($.rename('f.css'))
//   .pipe($.sourcemaps.write())
//   .pipe(gulp.dest(config.styles.fabricator.dest))
//   .pipe($.if(config.dev, reload({ stream: true })));
// });

// gulp.task('styles:toolkit', () => {
//   gulp.src(config.styles.toolkit.src)
//   .pipe($.if(config.dev, $.sourcemaps.init()))
//   .pipe($.sass({
//     includePaths: './node_modules',
//   }).on('error', $.sass.logError))
//   .pipe($.postcss([autoprefixer()]))
//   .pipe($.if(!config.dev, csso()))
//   .pipe($.if(config.dev, $.sourcemaps.write()))
//   .pipe(gulp.dest(config.styles.toolkit.dest))
//   .pipe($.if(config.dev, reload({ stream: true })));
// });

// gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);


// // scripts
// const webpackConfig = require('./webpack.config');

// gulp.task('scripts', (done) => {
//   webpack(webpackConfig, (err, stats) => {
//     if (err) {
//       $.util.log($.util.colors.red(err()));
//     }
//     const result = stats.toJson();
//     if (result.errors.length) {
//       result.errors.forEach((error) => {
//         $.util.log($.util.colors.red(error));
//       });
//     }
//     done();
//   });
// });


// // images
// gulp.task('images:fabricator', () => {
//   return gulp.src(config.images.fabricator.src)
//     .pipe($.imagemin())
//     .pipe(gulp.dest(config.images.fabricator.dest));
// });

// gulp.task('images:toolkit', () => {
//   return gulp.src(config.images.toolkit.src)
//     .pipe($.imagemin())
//     .pipe(gulp.dest(config.images.toolkit.dest));
// });

// gulp.task('favicon', () => {
//   return gulp.src('src/favicon.ico')
//     .pipe(gulp.dest(config.dest));
// });

// gulp.task('images', ['images:fabricator', 'images:toolkit', 'favicon']);


// // icons
// gulp.task('icons', () => {
//   return gulp.src(config.icons.toolkit.src)
//     .pipe($.svgSymbols({
//       templates: [
//         path.join(__dirname, 'src/templates/icons.svg'),
//       ],
//     }))
//     .pipe($.rename('icons.svg'))
//     .pipe(gulp.dest(config.icons.toolkit.dest));
// });


// // fonts
// gulp.task('fonts', () => {
//   return gulp.src(config.fonts.toolkit.src)
//     .pipe(gulp.dest(config.fonts.toolkit.dest));
// });


// // assembler
// gulp.task('assembler', (done) => {
//   assembler({
//     logErrors: config.dev,
//     dest: config.dest,
//     helpers: {
//       icons: () => {
//         const fileName = path.join(__dirname, config.icons.toolkit.dest, 'icons.svg');
//         const exists = fs.existsSync(fileName);

//         if (!exists) {
//           return `[File "${fileName}" doesn’t exist.]`;
//         }

//         return fs.readFileSync(fileName, 'utf-8');
//       },
//     },
//   });
//   done();
// });


// // server
// gulp.task('serve', () => {
//   browserSync({
//     server: {
//       baseDir: config.dest,
//     },
//     notify: false,
//     logPrefix: 'FABRICATOR',
//     open: false,
//   });

//   gulp.task('assembler:watch', ['assembler'], browserSync.reload);
//   $.watch(config.templates.watch, $.batch((events, done) => {
//     gulp.start('assembler:watch', done);
//   }));

//   gulp.task('styles:watch', ['styles']);
//   $.watch([config.styles.fabricator.watch, config.styles.toolkit.watch], $.batch((events, done) => {
//     gulp.start('styles:watch', done);
//   }));

//   gulp.task('scripts:watch', ['scripts'], browserSync.reload);
//   $.watch([config.scripts.fabricator.watch, config.scripts.toolkit.watch], $.batch((events, done) => {
//     gulp.start('scripts:watch', done);
//   }));

//   gulp.task('images:watch', ['images'], browserSync.reload);
//   $.watch([config.images.fabricator.watch, config.images.toolkit.watch], $.batch((events, done) => {
//     gulp.start('images:watch', done);
//   }));

//   gulp.task('icons:watch', () => {
//     runSequence('icons', 'assembler', browserSync.reload);
//   });
//   $.watch(config.icons.toolkit.watch, $.batch((events, done) => {
//     gulp.start('icons:watch', done);
//   }));

//   gulp.task('fonts:watch', ['fonts'], browserSync.reload);
//   $.watch(config.fonts.toolkit.watch, $.batch((events, done) => {
//     gulp.start('fonts:watch', done);
//   }));
// });


// // default build task
// gulp.task('default', ['clean'], () => {
//   runSequence(['styles', 'scripts', 'images', 'icons', 'fonts'], 'assembler', () => {
//     if (config.dev) {
//       gulp.start('serve');
//     }
//   });
// });