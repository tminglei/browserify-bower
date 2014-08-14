var expect = require('chai').expect,
    browserify = require('browserify'),
    vm = require('vm'),
    path = require('path'),
    brbower = require('..'),
    fs = require('fs');

describe('brbower', function() {

  it('should be able to brbower a basic file from dependencies', function(done) {
    var jsPath = path.join(__dirname, 'src/index.js');
    var b = browserify();
    b.plugin(brbower.setWorkdir(__dirname));
    b.add(jsPath);
    b.bundle(function (err, src) {
      if (err) return done(err);
      vm.runInNewContext(src, {
        console: {
          log: function (msg) {
            expect(msg).to.equal('hello, world');
            done();
          }
        }
      });
    });
  });

  it('should be able to brbower a basic file from devDependencies', function(done) {
    var jsPath = path.join(__dirname, 'src/base62test.js');
    var b = browserify();
    b.plugin(brbower.setWorkdir(__dirname));
    b.add(jsPath);
    b.bundle(function (err, src) {
      if (err) return done(err);
      vm.runInNewContext(src, {
        console: {
          log: function (msg) {
            expect(msg).to.equal(12345);
            done();
          }
        }
      });
    });
  });

  it('should be able to brbower a submodule', function(done) {
    var jsPath = path.join(__dirname, 'src/by_subpath.js');
    var b = browserify();
    b.plugin(brbower.setWorkdir(__dirname), {
      require: ['*', 'base62/lib/base62']
    });
    b.add(jsPath);
    b.bundle(function (err, src) {
      if (err) return done(err);
      vm.runInNewContext(src, {
        console: {
          log: function (msg) {
            expect(msg).to.equal(12345);
            done();
          }
        }
      });
    });
  });

  it('should be able to brbower a module with other dependencies', function(done) {
    var b = browserify();
    b.plugin(brbower.setWorkdir(__dirname));
    b.add(path.join(__dirname, 'src/deep_dependencies_test.js'));
    b.bundle(function (err, src) {
      if (err) return done(err);
      vm.runInNewContext(src);
      done();
    });
  });

});
