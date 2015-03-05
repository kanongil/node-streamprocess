module.exports = function processSequential(readable, initialLen, processFn, doneCb) {
  var err;

  if (typeof initialLen === 'function') {
    doneCb = processFn;
    processFn = initialLen;
    initialLen = undefined;
  }

  function getNext(n) {
    var res = readable.read(n);
    if (!res) {
      if (!err && readable.readable)
        return readable.once('readable', getNext);
      else if (doneCb)
        return doneCb(err);

      return; // silently stop
    }
    processFn(res, getNext)
  }

  if (doneCb) {
    readable.once('error', function(e) {
      err = e;
    });
  }

  // start it
  process.nextTick(function () {
    getNext(initialLen);
  });
}
