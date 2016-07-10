const util = require('gulp-util');
const through = require('through2');
const Kontainer = require('kontainer-js').default;

function start(/* opts = {} */) {
  return through.obj(function (file, enc, cb) {
    // console.log(`start: Received a vynil. path = ${file.path}`);
    if (file.isNull()) {
      cb(null, file);
    } else if (file.isBuffer()) {
      cb(new util.PluginError('gulp-ro', 'Buffer is not supported'));
    } else {
      const elements = [];
      const inputStream = file.contents;
      const outputStream = Kontainer.createObjectStream((type, element, depth) => {
        // console.log(`start: writting ${type}`);
        outputStream.emit('ro-data', {type, element, depth});
        if (depth === 0) {
          elements.push(element);
        }
      }, {ignoreUnknown: true})
      .once('error', this.emit.bind(this, 'error'));

      inputStream.once('end', () => {
        // console.log(`start: Consumed all data. elements.length = ${elements.length}`);
        if (elements.length > 0) {
          outputStream.push(elements[0].wrap(elements));
        }
        cb();
      });

      file.contents = inputStream.pipe(outputStream);
      this.push(file);
    }
  });
}

function end(/* opts = {} */) {
  return through.obj(function (file, enc, cb) {
    // console.log(`end: Received a vynil. path = ${file.path}`);
    if (file.isNull()) {
      cb(null, file);
    } else if (file.isBuffer()) {
      cb(new util.PluginError('gulp-ro', 'Buffer is not supported'));
    } else {
      const inputStream = file.contents;
      const outputStream = through.obj();

      inputStream.once('data', rootElement => {
        // console.log(`end: Writing rootElement`);
        outputStream.push(Kontainer.render(rootElement));
      })
      .once('end', () => {
        // console.log(`end: Consumed all data.`);
        cb();
      });

      outputStream.once('error', this.emit.bind(this, 'error'));

      file.contents = inputStream.pipe(outputStream);
      this.push(file);
    }
  });
}

module.exports = {start, end};
