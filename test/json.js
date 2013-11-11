var test = require('tap').test,
    createGraph = require('ngraph.graph'),
    json = require('../json');

test('Can save and load graph', function (t) {
  var g = createGraph();
  g.addLink(1, 2);

  var storedJSON = json.save(g);

  var loadedData = JSON.parse(storedJSON),
      links = loadedData.links,
      nodes = loadedData.nodes;

  t.equal(nodes.length, 2, "Stored data has two nodes");
  t.equal(links.length, 1, "Stored data has one link");
  t.equal(links[0].fromId, 1, "Link starts at correct node");
  t.equal(links[0].toId, 2, "Link ends at correct node");

  var loadedGraph = json.load(storedJSON);
  t.ok(loadedGraph.getNode(1) && loadedGraph.getNode(2) && loadedGraph.getNodesCount() === 2, 'Should have all nodes');
  t.ok(loadedGraph.hasLink(1, 2) && loadedGraph.getLinksCount() === 1, 'Should have all links');

  t.end();
});
