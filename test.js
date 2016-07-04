import path from 'path';
import fs from 'fs';
import test from 'ava';
import util from 'gulp-util';
import through from 'through2';
import Kontainer from 'kontainer-js';
import {start, end} from './';

test.cb('start', t => {
  const testContentsDir = __dirname;
  const testContentsPathMP4 = path.join(__dirname, 'test.mp4');
  const stream = start();

  let trakCount = 0;
  let mdatCount = 0;

  stream.on('data', elem => {
    if (!elem) {
      return;
    }
    // console.log(elem.type.COMPACT_NAME);
    if (elem.type.COMPACT_NAME === 'trak') {
      trakCount++;
    } else if (elem.type.COMPACT_NAME === 'mdat') {
      mdatCount++;
    }
  });

  stream.once('end', () => {
    t.is(trakCount, 1);
    t.is(mdatCount, 1);
    t.end();
  });

  stream.write(new util.File({
    base: testContentsDir,
    path: testContentsPathMP4,
    contents: fs.createReadStream(testContentsPathMP4)
  }));

  stream.end();
});

test.cb('end', t => {
  const testContentsDir = __dirname;
  const testContentsPathMP4 = path.join(__dirname, 'test.mp4');
  const stream = end();
  let buffer = null;

  fs.readFile(testContentsPathMP4, (err, buf) => {
    if (err) {
      t.end();
      return;
    }

    const input = through.obj();
    input.end(Kontainer.createElementFromBuffer(buf));

    stream.write(new util.File({
      base: testContentsDir,
      path: testContentsPathMP4,
      contents: input
    }));
    stream.end();
  });

  stream.on('data', file => {
    const chunk = file.contents;
    if (util.isBuffer(chunk)) {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = chunk;
      }
    }
  });

  stream.on('finish', () => {
    t.is(util.isBuffer(buffer), true);
    t.end();
  });
});
