import test from 'ava';
import gulp from 'gulp';
import through from 'through2';
import util from 'gulp-util';
import {start, end} from './';

test.cb('gulp-ro', t => {
  const inputFileList = ['a-only-moov.mp4', 'v-only-moov.mp4'];
  let buffer = null;
  let count = 0;
  const tester = through.obj((file, enc, cb) => {
    // console.log(`tester: Received a vynil. path = ${file.path}`);
    if (file.isStream()) {
      const inputStream = file.contents;
      const outputStream = through.obj();

      inputStream.once('end', () => {
        // console.log(`tester: Consumed all data. buffer.length = ${buffer.length}`);
        cb();
        t.is(util.isBuffer(buffer), true);
        count++;
        if (count === inputFileList.length) {
          t.end();
        }
      });

      outputStream.on('ro-data', node => {
        t.fail(`ro-data event should not be received in the last stream (${node.type})`);
      })
      .once('data', buf => {
        // console.log(`tester: Received a buffer. buffer.length = ${buf.length}`);
        buffer = buf;
      })
      .once('error', err => {
        t.fail(`An error occurred at ${err.stack}`);
      });

      inputStream.pipe(outputStream);
    } else {
      t.fail(`vinyl is not stream`);
    }
  });

  gulp.src(inputFileList, {buffer: false})
  .pipe(start())
  .pipe(end())
  .pipe(tester);
});
