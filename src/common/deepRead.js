const R = require('ramda');
const fs = require('fs');
const path = require('path');

var deepRead = R.curry(function(readF, dir) {

  function isFile(f) {
    return fs.statSync(f).isFile();
  }

  function concatToPath(f) {
    return path.join(dir,f);
  }

  // Read all files in a folder.
  var reader = R.pipe(
    fs.readdirSync,
    R.map(concatToPath),
    R.map(R.ifElse(isFile, readF, deepRead(readF))),
    R.flatten
  );

  var files = reader(dir);

  return files;
});

module.exports = deepRead;
