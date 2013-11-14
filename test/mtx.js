var test = require('tap').test,
    createGraph = require('ngraph.graph'),
    mtx = require('../mtx'),
    testData = loadTestData();

test('Can load mtx graph', function (t) {
  var g = mtx.load(testData);

  t.equal(g.getNodesCount(), 5, 'Should be expected number of nodes');
  t.equal(g.getLinksCount(), 3, 'Should be expected number of links');
  t.ok(g.hasLink(1, 4), 'There is link between 1 and 4');

  // Our implementation does not allow loops, thus any loop within mtx format
  // is considered as a node data itself. Please let me know if you think
  // it's a show stopper for you, and I'll make this work ;-]
  t.equal(g.getNode(2).data, 1.5, "No loops");
  t.end();
});

test('Can use mtxParser', function (t) {
  var mtxArray = testData.split('\n'),
      mtxParser = mtx.createLineParser();

  mtxArray.forEach(function(line) {
    mtxParser.parse(line);
  });

  var g = mtxParser.getGraph();

  t.equal(g.getNodesCount(), 5, 'Should be expected number of nodes');
  t.equal(g.getLinksCount(), 3, 'Should be expected number of links');
  t.ok(g.hasLink(1, 4), 'There is link between 1 and 4');
  t.ok(mtxParser.getDescription(), 'Contains description');

  // Our implementation does not allow loops, thus any loop within mtx format
  // is considered as a node data itself. Please let me know if you think
  // it's a show stopper for you, and I'll make this work ;-]
  t.equal(g.getNode(2).data, 1.5, "No loops");
  t.end();
});

test('Can save/load object', function (t) {
  var g = mtx.load(testData);

  t.test('Includes data', function (t) {
    var saved = mtx.saveToObject(g),
        linksCount = g.getLinksCount();
    t.equal(saved.recordsPerEdge, 3, 'Should have three records per edge')
    t.equal(saved.links.length, linksCount * saved.recordsPerEdge, 'Should save data by default');
    t.end();
  });

  t.test('Skips data when not required', function (t) {
    var saved = mtx.saveToObject(g, false),
        linksCount = g.getLinksCount();
    t.equal(saved.recordsPerEdge, 2, 'Should have two records per edge')
    t.equal(saved.links.length, linksCount * saved.recordsPerEdge, 'Should save data by default');
    t.end();
  });

  t.test('Skips data when there is no data', function (t) {
    var g = createGraph();
    g.addLink(1, 2); // no data
    g.addLink(2, 3); // no data

    var includeData = true; // explicitly require to include data
    var saved = mtx.saveToObject(g, includeData);
    t.equal(saved.recordsPerEdge, 2, 'Should have two records per edge')
    t.equal(saved.links.length, 2 * saved.recordsPerEdge, 'Should save data by default');
    t.end();
  });

  t.test('Can save and load graph with data', function (t) {
    var g = createGraph();
    g.addLink(1, 2, 1); g.addLink(2, 3, 2);

    var includeData = true;
    var saved = mtx.saveToObject(g, includeData);
    var g1 = mtx.loadFromObject(saved);
    var link12 = g1.hasLink(1, 2), link23 = g1.hasLink(2, 3);
    t.ok(link12 && link23 && g1.getLinksCount() === 2, 'Has all links');
    t.equal(link12.data, 1, "Link12 has valid data");
    t.equal(link23.data, 2, "Link23 has valid data");
    t.end();
  });

  t.test('Can save and load graph without data', function (t) {
    var g = createGraph();
    g.addLink(1, 2, 1); g.addLink(2, 3, 2);

    var includeData = false;
    var saved = mtx.saveToObject(g, includeData);
    var g1 = mtx.loadFromObject(saved);
    var link12 = g1.hasLink(1, 2), link23 = g1.hasLink(2, 3);
    t.ok(link12 && link23 && g1.getLinksCount() === 2, 'Has all links');
    t.ok(!link12.data, "Link12 has no data");
    t.ok(!link23.data, "Link23 has no data");
    t.end();
  });
});

function loadTestData() {
  return [
    '%%MatrixMarket matrix coordinate real general',
    '%=================================================================================',
    '%',
    '% This ASCII file represents a sparse MxN matrix with L' ,
    '% nonzeros in the following Matrix Market format:',
    '%',
    '% +----------------------------------------------+',
    '% |%%MatrixMarket matrix coordinate real general | <--- header line',
    '% |%                                             | <--+',
    '% |% comments                                    |    |-- 0 or more comment lines',
    '% |%                                             | <--+'         ,
    '% |    M  N  L                                   | <--- rows, columns, entries',
    '% |    I1  J1  A(I1, J1)                         | <--+',
    '% |    I2  J2  A(I2, J2)                         |    |',
    '% |    I3  J3  A(I3, J3)                         |    |-- L lines',
    '% |        . . .                                 |    |',
    '% |    IL JL  A(IL, JL)                          | <--+',
    '% +----------------------------------------------+'   ,
    '%',
    '% Indices are 1-based, i.e. A(1,1) is the first element.',
    '%',
    '%=================================================================================',
    '  5  5  8',
    '    1     1   1',
    '    2     2   1.5',
    '    3     3   1.5',
    '    1     4   6.0',
    '    4     2   2.5',
    '    4     4  -2.8',
    '    4     5   3.3',
    '    5     5   1.2'
  ].join('\n');
}
