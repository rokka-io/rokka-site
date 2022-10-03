const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'));

const gutil = require('gulp-util')
const uglify = require('gulp-uglify')
const autoprefixer = require('gulp-autoprefixer')
const htmlmin = require('gulp-htmlmin')
const svgmin = require('gulp-svgmin')
const include = require('gulp-include')
const injectSvg = require('gulp-inject-svg')
const exec = require('child_process').exec
const del = require('del')
const pump = require('pump')
const browserSync = require('browser-sync').create()
const runSequence = require('gulp4-run-sequence')
const config = require('./gulpconfig.js')

let env = 'local'

gulp.task('clean', () => {
    return del([config.dest])
})

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: config.dest
        },
        open: false,
        reloadDelay: 1000,
        notify: false
    })

    gulp.watch('source-assets/styles/**/*.scss', gulp.series('compile:styles'))
    gulp.watch('source-assets/scripts/**/*.js', gulp.series('compile:scripts'))
    gulp.watch('source/**/*', (done) => {
        runSequence('compile', 'inject', done())
    })
})

/*
  Assets
 */

gulp.task('copy:favicons', () => {
    return gulp.src('source-assets/favicons/**/*')
      .pipe(gulp.dest(config.dest))
      .pipe(browserSync.stream())
})

gulp.task('copy:pdf', () => {
    return gulp.src('source-assets/pdf/**/*')
      .pipe(gulp.dest('dist/assets/pdf/'))
})
gulp.task('copy:wellknown', () => {
    return gulp.src('source-assets/.well-known/**/*')
      .pipe(gulp.dest('dist/.well-known/'))
})
gulp.task('copy:securitytxt', () => {
    return gulp.src('source-assets/.well-known/security.txt')
      .pipe(gulp.dest('dist/'))
})


gulp.task('copy:fonts', () => {
    return gulp.src('source-assets/liip-styleguide/dist/assets/toolkit/fonts/**/*')
      .pipe(gulp.dest('dist/assets/fonts/'))
})


gulp.task('copy:images', () => {
    return gulp.src([
        'source-assets/images/**/*',
        'source-assets/liip-styleguide/dist/assets/toolkit/icons/icons.svg'
    ])
      .pipe(gulp.dest('dist/assets/images/'))
      .pipe(browserSync.stream())
})


gulp.task('copy', gulp.series('copy:favicons', 'copy:fonts', 'copy:images', 'copy:pdf', 'copy:wellknown', 'copy:securitytxt'))


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
      .pipe(browserSync.stream())
})


gulp.task('compile:scripts', () => {
    return gulp.src(config.scripts.src)
      .pipe(include()).on('error', gutil.log)
      .pipe(gulp.dest(config.scripts.dest))
      .pipe(browserSync.stream())
})


gulp.task('compile:sculpin', (cb) => {
    let count = 0

    for (const lang of config.languages) {
        let sculpinEnv = env + '_' + lang
        let sculpinCmd = 'vendor/sculpin/sculpin/bin/sculpin generate --env=' + sculpinEnv

        exec(sculpinCmd, (err, stdout, stderr) => {
            gutil.log('Sculpin: ' + gutil.colors.cyan(sculpinEnv) + '\n\n' + stdout)
            gutil.log(gutil.colors.red(stderr))

            count++
            if (count == config.languages.length) {
                cb()
            }
        })
    }

})


gulp.task('compile:html', gulp.series('compile:sculpin', () => {

    return Promise.all([
        new Promise(function (resolve, reject) {
            gulp.src('output_' + env + '_en/index.html')
              .pipe(gulp.dest(config.dest))
              .on('end', resolve)
        }),
        new Promise(function (resolve, reject) {
            gulp.src('output_' + env + '_en/documentation/**/*')
              .pipe(gulp.dest(config.dest + 'documentation'))
              .on('end', resolve)
        }),
        new Promise(function (resolve, reject) {
            gulp.src('output_' + env + '_de/**/*')
              .pipe(gulp.dest(config.dest + 'de'))
              .on('end', resolve)
        }),
        new Promise(function (resolve, reject) {
            gulp.src('output_' + env + '_en/**/*')
              .pipe(gulp.dest(config.dest + 'en'))
              .on('end', resolve)
        })
    ]).then(function () {
        del([
            config.dest + 'de/documentation/',
            config.dest + 'en/documentation/',
            'output_' + env + '_en',
            'output_' + env + '_de'
        ], {force: true})
    })
}))

gulp.task('compile', gulp.series('compile:styles', 'compile:scripts', 'compile:html'))

gulp.task('inject', (done) => {
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
            .pipe(gulp.dest(config.dest)).on('end', () => done());
      })

})

gulp.task('minify:scripts', gulp.series((cb) => {

      pump(
        [gulp.src('dist/assets/scripts/*.js'),
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
            gulp.dest('dist/assets/scripts/')]
        , cb()
      )
  }
))


// gulp.task('minify:styles', () => {
//   return gulp.src('dist/assets/styles/rokka.css')
//     .pipe(uncss({
//         html: ['dist/**/*.html'],
//         ignore: [/language\-[\S]+/, /token[\S]+/, 'svg', '.logo', '.navbar'],
//         timeout: 1000
//     }))
//     .pipe(cleancss({
//       level: {
//         1: {
//           specialComments: 0
//         },
//         2: {
//           all: true
//         }
//       }
//     }))
//     .pipe(gulp.dest('dist/assets/styles/'))
// });


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
})

gulp.task('minify', gulp.series(/*'minify:styles',*/ 'minify:scripts' /*'minify:html'*/), (done) => {
    console.log("done", done)
    done()
})

gulp.task('build:stage', (done) => {
    env = 'stage'
    runSequence('build', done)
})

gulp.task('build:prod', (done) => {
    env = 'prod'
    runSequence('build', done)
})


gulp.task('build', gulp.series('clean', (done) => {
    runSequence('compile', 'copy', 'inject', 'minify:scripts', () => done())
}))

gulp.task('default', gulp.series('clean', (done) => {
    runSequence('compile', 'copy', 'inject', 'serve', () => done())
}))



