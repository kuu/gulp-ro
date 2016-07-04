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

    try {
      const streamer = Kontainer.createObjectStream((_, elem) => {
        this.push(elem);
      })
      .once('format', this.emit.bind(this, 'format'))
      .once('finish', () => {
        this.emit('end');
        cb();
      })
      .once('error', this.emit.bind(this, 'error'));

      file.contents = file.contents.pipe(streamer);
    } catch (err) {
      this.emit('error', new util.PluginError('gulp-ro', err));
    }

    // cb();
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
