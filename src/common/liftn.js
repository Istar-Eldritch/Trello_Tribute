'use strict';

const R = require('ramda');


function liftn(f) {
  let fArgs = R.tail(R.values(arguments));
  return new Promise((resolve, reject) => {
    fArgs.push((err, succ) => {
      if(R.isNil(err)) {
        resolve(succ);
      } else {
        reject(err);
      }
    });
    R.apply(f, fArgs);
  });
}

module.exports = liftn;
