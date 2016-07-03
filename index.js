const util = require('gulp-util');
const through = require('through2');
const Kontainer = require('kontainer-js').default;

function start(opts = {}) {
  console.log(opts);
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isBuffer()) {
      cb(new util.PluginError('gulp-ro', 'Buffer not supported'));
      return;
    }

    const inputStream = file.contents;

    try {
      const streamer = Kontainer.createObjectStream((type, elem) => {
        this.emit(type, elem);
      })
      .once('format', this.emit.bind(this, 'format'))
      .once('error', this.emit.bind(this, 'error'));

      inputStream.once('end', this.emit.bind(this, 'end'));

      file.contents = inputStream.pipe(streamer);
    } catch (err) {
      this.emit('error', new util.PluginError('gulp-ro', err));
    }

    cb();
  });
}

function end(opts = {}) {
  console.log(opts);
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isBuffer()) {
      cb(new util.PluginError('gulp-ro', 'Buffer not supported'));
      return;
    }

    file.contents.once('finish', () => {
      try {
        const element = file.contents.read();
        file.contents = Kontainer.render(element);
        this.push(file);
      } catch (err) {
        this.emit('error', new util.PluginError('gulp-ro', err));
      }
      cb();
    });
  });
}

module.exports = {start, end};
