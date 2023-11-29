var test = require('tap').test;
var lib = require('../index.js');

test('it should have json and mtx', function (t) {
  t.ok(lib.json, 'Should have json');
  t.ok(lib.mtx, 'Should have mtx');
  t.end();
});