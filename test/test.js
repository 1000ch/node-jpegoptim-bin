/*global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('assert');
var binCheck = require('bin-check');
var BinBuild = require('bin-build');
var execFile = require('child_process').execFile;
var fs = require('fs');
var path = require('path');
var rm = require('rimraf');

describe('jpegoptim()', function () {
  afterEach(function (callback) {
    rm(path.join(__dirname, 'tmp'), callback);
  });

  beforeEach(function () {
    fs.mkdirSync(path.join(__dirname, 'tmp'));
  });

  it('should rebuild the jpegoptim binaries', function (callback) {
    var tmp = path.join(__dirname, 'tmp');
    var builder = new BinBuild()
      .src('https://github.com/tjko/jpegoptim/archive/RELEASE.1.4.1.tar.gz')
      .cmd('./configure --prefix="' + tmp + '" --bindir="' + tmp + '"')
      .cmd('make install')
      .cmd('mv ' + path.join(tmp, 'bin/jpegoptim') + ' ' + path.join(tmp, 'jpegoptim'));

    builder.build(function (error) {
      assert(!error);
      assert(fs.existsSync(path.join(tmp, 'jpegoptim')));
      callback();
    });
  });

  it('should return path to binary and verify that it is working', function (callback) {
    var binPath = require('../').path;

    binCheck(binPath, ['--version'], function (error, works) {
      assert(!error);
      assert.equal(works, true);
      callback();
    });
  });

  it('should minify a JPEG', function (callback) {
    var binPath = require('../').path;
    var args = [
      '--strip-all',
      '--all-progressive',
      '--dest=' + path.join(__dirname, 'tmp'),
      path.join(__dirname, 'fixtures/test.jpg')
    ];

    execFile(binPath, args, function (error) {
      var src = fs.statSync(path.join(__dirname, 'fixtures/test.jpg')).size;
      var dest = fs.statSync(path.join(__dirname, 'tmp/test.jpg')).size;

      assert(!error);
      assert(dest < src);
      callback();
    });
  });
});
