var assert = require('assert'),
    R = require('stream').Readable;

var streamprocess = require('../streamprocess');

var COUNT = 5;

function testObj(r, done) {
  var count = 0;
  var ended = false;

  streamprocess(r, function(obj, cb) {
    assert(obj);

    console.error('got object', obj);
    setImmediate(function() {
      console.error('processed obj', obj);
      count++;
      cb();
    });
  }, function (err) {
    assert.equal(count, COUNT)
    done(err, ended);
  });

  r.on('end', function() {
    ended = true;
  });
}

var r1 = new R({objectMode:true});
r1.index = 0;
r1._read = function(n) {
  if (this.index === COUNT)
    return this.push(null);

  this.push({ index:this.index++ });
};

testObj(r1, function(err, ended) {
  assert.ifError(err);
  assert(ended);
});

var r2 = new R({objectMode:true});
r2.index = 0;
r2._read = function(n) {
  if (this.index === COUNT)
    return this.emit('error', new Error('aborted'));

  this.push({ index:this.index++ });
};

testObj(r2, function(err) {
  assert(err);
});


function testBuf(r, done) {
  var len = 0;
  var ended = false;

  streamprocess(r, 1, function(buf, cb) {
    assert(buf);

    console.error('got buffer', buf);
    setImmediate(function() {
      console.error('processed buffer', buf);
      len += buf.length;
      cb(2);
    });
  }, function (err) {
    assert.equal(len, COUNT)
    done(err, ended);
  });

  r.on('end', function() {
    ended = true;
  });
}

var r3 = new R({highWaterMark:1});
r3.index = 0;
r3._read = function(n) {
  if (this.index === COUNT)
    return this.push(null);

  this.index++;
  this.push(new Buffer(1));
};

testBuf(r3, function(err, ended) {
  assert.ifError(err);
  assert(ended);
});


