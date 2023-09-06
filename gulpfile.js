const { readFileSync } = require('fs'),
  { series, parallel, src, dest, watch } = require('gulp'),
  angularTemplatecache = require('gulp-angular-templatecache'),
  cleanCss = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  del = require('del'),
  footer = require('gulp-footer'),
  gulpIf = require('gulp-if'),
  header = require('gulp-header'),
  ngAnnotate = require('gulp-ng-annotate-patched'),
  rev = require('gulp-rev'),
  revRewrite = require('gulp-rev-rewrite'),
  sass = require('gulp-sass')(require('sass')),
  shell = require('gulp-shell'),
  uglify = require('gulp-uglify');

const scripts = [
  'node_modules/angular/angular.js',
  'node_modules/angular-*/*.js',
  '!node_modules/angular*/*.min.js',
  '!node_modules/angular*/*-mocks.js',
  '!node_modules/angular*/index.js',
  '!node_modules/angular-mocks/*.js',
  'src/**/*.module.js',
  'src/app.module.js',
  'src/js/index.js',
  'src/**/*.js',
  '!src/**/*.spec.js',
  '!src/app.min.js',
];

const styles = ['src/css/index.scss', 'src/**/*.scss'],
  styleIncludes = ['node_modules/angular-material'];

function is_src(file) {
  return !/node_modules/.test(file.path);
}

/* Development */ //////////////////////////////////////////

function js() {
  return src(scripts, { sourcemaps: true })
    .pipe(gulpIf(is_src, header('(function() { "use strict";\n')))
    .pipe(gulpIf(is_src, footer('\n})();')))
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate({ add: true }))
    .pipe(dest('src', { sourcemaps: '.' }));
}

function css() {
  return src(styles, { sourcemaps: true })
    .pipe(concat('app.min.scss'))
    .pipe(sass({ includePaths: styleIncludes }).on('error', sass.logError))
    .pipe(dest('src', { sourcemaps: '.' }));
}

function serve(done) {
  connect.server(
    {
      root: 'src/',
      port: 8888,
      fallback: 'src/index.html',
      livereload: true,
    },
    done
  );
}

function reload(path) {
  return src(path).pipe(connect.reload());
}

function reload_js() {
  return reload('src/app.min.js');
}

function reload_css() {
  return reload('src/app.min.css');
}

function watch_src(done) {
  watch(['src/**/*.html']).on('all', (event, path) => reload(path));
  watch(scripts, series(js, reload_js));
  watch(styles, series(css, reload_css));
  done();
}

exports.default = series(parallel(js, css), parallel(serve, watch_src));

/* Distribution */ /////////////////////////////////////////

function dist_clean() {
  return del(['dist/**/*']);
}

const templates = ['src/**/*.html', '!src/index.html'];

function partials() {
  return src(templates)
    .pipe(
      angularTemplatecache('templates.js', {
        transformUrl: function (url) {
          // Remove leading slash which occurs in gulp 4
          return url.replace(/^\/+/g, '');
        },
      })
    )
    .pipe(dest('dist'));
}

function dist_js_build() {
  return src(scripts.concat(['dist/templates.js']), { sourcemaps: true })
    .pipe(gulpIf(is_src, header('(function() { "use strict";\n')))
    .pipe(gulpIf(is_src, footer('\n})();')))
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate({ add: true }))
    .pipe(uglify())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

function dist_js() {
  return del(['dist/templates.js']);
}

function dist_css() {
  return src(styles, { sourcemaps: true })
    .pipe(concat('app.min.scss'))
    .pipe(sass({ includePaths: styleIncludes }).on('error', sass.logError))
    .pipe(cleanCss())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

function revision() {
  return src(['dist/app.min.css', 'dist/app.min.js'])
    .pipe(rev())
    .pipe(dest('dist'))
    .pipe(rev.manifest())
    .pipe(dest('dist'));
}

function dist_index() {
  const manifest = readFileSync('dist/rev-manifest.json');
  return src('src/index.html')
    .pipe(revRewrite({ manifest }))
    .pipe(dest('dist'));
}

function dist_app() {
  return del(['dist/app.min.css', 'dist/app.min.js', 'dist/rev-manifest.json']);
}

function dist_favicon() {
  return src('src/favicon.png').pipe(dest('dist'));
}

function dist_images() {
  return src('src/images/**/*.*').pipe(dest('dist/images'));
}

exports.build = series(
  dist_clean,
  parallel(
    series(
      parallel(series(partials, dist_js_build, dist_js), dist_css),
      revision,
      dist_index,
      dist_app
    ),
    dist_favicon,
    dist_images
  )
);

function dist_serve(done) {
  connect.server(
    {
      root: 'dist/',
      port: 8888,
      fallback: 'dist/index.html',
    },
    done
  );
}
exports.dist_serve = dist_serve;
