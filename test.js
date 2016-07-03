import path from 'path';
import fs from 'fs';
import stream from 'stream';
import test from 'ava';
import util from 'gulp-util';
import Kontainer from 'kontainer-js';
import {start, end} from './';

test.cb('start', t => {
  const testContentsDir = __dirname;
  const testContentsPathMP4 = path.join(__dirname, 'test.mp4');
  const stream = start();

  let trakCount = 0;
  let mdatCount = 0;

  stream.on('trak', elem => {
    if (elem) {
      trakCount++;
    }
  });

  stream.on('mdat', elem => {
    if (elem) {
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
  const testContentsPathMP4 = path.join(__dirname, 'test-a-only.mp4');
  const renderer = end();
  let buffer = null;

  fs.readFile(testContentsPathMP4, (err, buf) => {
    if (err) {
      t.end();
      return;
    }

    const input = new stream.PassThrough({objectMode: true});
    input.end(Kontainer.createElementFromBuffer(buf));

    renderer.write(new util.File({
      base: testContentsDir,
      path: testContentsPathMP4,
      contents: input
    }));
    renderer.end();
  });

  renderer.on('data', file => {
    const chunk = file.contents;
    if (util.isBuffer(chunk)) {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = chunk;
      }
    }
  });

  renderer.on('finish', () => {
    t.is(util.isBuffer(buffer), true);
    t.end();
  });
});
