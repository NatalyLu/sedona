const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const htmlmin = require("gulp-htmlmin");
const sync = require("browser-sync").create();
const del= require('del');

// HTML

const html = () => {
  return gulp.src("source/**/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
};

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(less())
  .pipe(postcss([
  autoprefixer(),
  csso()
  ]))
  .pipe(sourcemap.write("."))
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(sync.stream());
};

exports.styles = styles;

// Images

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
};

exports.optimizeImages = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(gulp.dest("source/img"))
};

exports.copyImages = copyImages;

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"))
};

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
return gulp.src(["source/img/icons/sprites/**/*.svg", "!source/img/icons/sprites/**/sprite.svg"])
.pipe(svgstore())
.pipe(rename("sprite2.svg")) //.pipe(rename("sprite.svg"))
.pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg}",
    "source/img/icons/favicons/*.svg",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
};

exports.copy = copy;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Reload

const reload = done => {
  sync.reload();
  done();
};

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/*.html", gulp.series(html, reload));
};

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Build

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    sprite,
    createWebp
  ),
);

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
