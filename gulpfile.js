var gulp = require('gulp'); // gulp
var sass = require('gulp-sass'); // SASS编译插件
var browserSync = require('browser-sync'); // 浏览器自动刷新
var reload = browserSync.reload;
var useref = require('gulp-useref'); // JS文件拼接
var uglify = require('gulp-uglify'); // JS文件压缩
var gulpIf = require('gulp-if'); // 任务区分
var minifyCSS = require('gulp-minify-css'); // CSS文件压缩
var imagemin = require('gulp-imagemin'); // 图片压缩
var cache = require('gulp-cache'); // 减少重复压缩
var del = require('del'); // 清除生成文件
var runSequence = require('run-sequence'); // 多任务执行

gulp.task('hello', function() {
  console.log('Hello World!');
});

// SASS编译
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // 须编译文件目录
    .pipe(sass()) // 编译 SASS 文件为普通 CSS 文件
    .pipe(gulp.dest('app/css')) // 输出目录
    .pipe(reload({stream: true})) // 刷新浏览器 Browser Sync
});

// browser-sync
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: './app'
    }
  })
});

// 静态服务器 + 监听 scss/html 文件
gulp.task('watch', ['browserSync', 'sass'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', reload);
  gulp.watch('app/js/**/*.js', reload);
});

// JavaScript、CSS文件合并与压缩
gulp.task('useref', function() {
  return gulp.src('app/*.html')
    .pipe(useref()) // 文件合并
    .pipe(gulpIf('*.js', uglify())) // JavaScript文件压缩
    .pipe(gulpIf('*.css', minifyCSS())) // CSS文件压缩
    .pipe(gulp.dest('dist')) // 生成页面到生产环境
});

// 优化图片
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin({
      optimizationLevel: 5, // 类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, // 类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, // 类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true // 类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('dist/images'))
});

// 复制字体
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

// 清除生成文件
gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
});

gulp.task('clean:dist', function() {
  del(['dist/**/*', '!dist/images', '!dist/images/**/*'])
});

// 构建序列
// SASS自动编译,Browser Sync自动刷新
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'], callback)
});
// 生成到生成环境
gulp.task('build', function(callback) {
  runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback)
});


