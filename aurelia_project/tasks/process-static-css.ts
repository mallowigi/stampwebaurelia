import * as gulp from 'gulp';
import * as less from 'gulp-less';
import * as cleanCSS from 'gulp-clean-css';
import * as project  from '../aurelia.json';

export function processStaticCSS() {
  return gulp.src(project.staticCSS.source)
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest(project.paths.staticCSS));

};

export default processStaticCSS;
