# gulp-ro
A video editing tool built on top of the Gulp ecosystem
[![Build Status](https://travis-ci.org/kuu/gulp-ro.svg?branch=master)](http://travis-ci.org/kuu/gulp-ro)

## Usage
```js
import gulp from 'gulp';
import {start, end} from 'gulp-ro';
import merge from 'gulp-ro-merge';
import drop from 'gulp-ro-drop';
import shift from 'gulp-ro-shift';
import slice from 'gulp-ro-slice';
import rename from 'gulp-rename';

// Merges video files into a single file and applies some changes to it
gulp.src('./input/*.mp4', {buffer: false})
.pipe(start())
.pipe(merge()) // Combines tracks across multiple files
.pipe(drop(999)) // Removes track with the specific track-id
.pipe(shift(888, -10)) // Move the position of the track 10 seconds backwards
.pipe(slice(10, 50)) // Trims the first 10 seconds and the last 10 seconds
.pipe(end())
.pipe(rename('merged.mp4'))
.pipe(gulp.dest('./output/'));
```
## API

### Methods

#### `start(options)`
Creates a transform stream that converts a vinyl of buffer stream into a vinyl of [`KontainerElement`](https://www.npmjs.com/package/kontainer-js) object stream

##### params

| name | type | description |
|---|---|---|
| `options` | Object| TBD. |

##### return value
A transform stream

---
#### `end(options)`
Creates a transform stream that converts a vinyl of `KontainerElement` object stream into a vinyl of buffer

##### params
| name | type | description |
|---|---|---|
| `options` | Object| TBD. |

##### return value
A transform stream

## CLI
TBD.

### List all the tracks contained in a file
```
$ ro ls file.mp4
```

### Merge files
```
$ ro merge main.webm audio/*/sub.webm > output.webm
```

### Remove a track from a file
```
$ cat file.mp4 | ro drop 999 > output.mp4
 => Removes a track (track-id=999)
```

### Av-sync adjustment
```
$ cat file.mp4 | ro shift 999 -10 > output.mp4
 => Shifts the track 10 seconds backward
```

### Trimming
```
$ cat file.webm | ro slice 10 50 > output.webm
 => Extract the middle of the file (10-49 seconds)
   i.e. cuts off the first 10 seconds and the last 10 seconds
   (supposing the original duration was 60 seconds.)
```

## Development

### Principles

* `ro` is a set of plugins overlaid on top of the gulp plugins (plugins between `start()` and `end()` are `ro` plugins)
* There's no difference between `ro` plugins and gulp plugins except that the content of `ro` plugin is a stream of [`KontainerElement`](https://www.npmjs.com/package/kontainer-js) object
* ro plugins should be distinguished by the name; gulp-ro-xxx, where xxx should express a unique editing operation
