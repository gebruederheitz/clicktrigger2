import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

let CURRENT_TASK_IS_WATCH = false;

function buildScss(cb) {
    const postcssTasks = [autoprefixer];
    if (!CURRENT_TASK_IS_WATCH) {
        postcssTasks.push(cssnano);
    }

    gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssTasks))
        .pipe(gulp.dest('./dist'));

    cb();
}

export function watch() {
    CURRENT_TASK_IS_WATCH = true;
    gulp.watch('./scss/**/*.scss', { ignoreInitial: false }, buildScss);
}

export default buildScss;
