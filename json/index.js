module.exports = {
  save: save,
  load: load
};

/**
 * # JSON Storage
 *
 * JSON storage is the most readable and simple graph storage format. Main
 * drawback of this format is its size - for large graph due to verbosity
 * of the format it can take more space then it could.
 *
 * Example:
 * ```
 *   // save file to JSON string:
 *   var storedGraph = save(graph);
 *   // Load graph from previously saved string
 *   var loadedGraph = load(storedGraph);
 *   // loadedGraph is a copy of original `graph`
 * ```
 */

// Save
// ----
// Graph is saved as a JSON object and returned as a string.
function save(graph) {
  // Object contains `nodes` and `links` arrays.
  var result = {
    nodes: [],
    links: []
  };

  graph.forEachNode(function (node) {
    // Each node of the graph is processed to take only required fields
    // `id` and `data`
    result.nodes.push(transformNodeForSave(node));
  });

  graph.forEachLink(function (link) {
    // Each link of the graph is also processed to take `fromId`, `toId` and
    // `data`
    result.links.push(transformLinkForSave(link));
  });

  return JSON.stringify(result);
}

function transformNodeForSave(node) {
  var result = { id: node.id };
  // We don't want to store undefined fields when it's not necessary:
  if (node.data !== undefined) {
    result.data = node.data;
  }

  return result;
}

function transformLinkForSave(link) {
  var result = {
    fromId: link.fromId,
    toId: link.toId,
  };

  if (link.data !== undefined) {
    result.data = link.data;
  }

  return result;
}

// Load
// ----
//
// To load previously stored graph, simply call `load()`.
function load(jsonGraph) {
  if (typeof jsonGraph !== 'string') {
    throw new Error('Cannot load graph which is not stored as a string');
  }
  var stored = JSON.parse(jsonGraph),
      graph = require('ngraph.graph')(),
      i;

  if (stored.links === undefined || stored.nodes === undefined) {
    throw new Error('Cannot load graph without links and nodes');
  }

  for (i = 0; i < stored.nodes.length; ++i) {
    var parsedNode = stored.nodes[i];
    if (!parsedNode.hasOwnProperty('id')) {
      throw new Error('Graph node format is invalid: Node id is missing');
    }

    graph.addNode(parsedNode.id, parsedNode.data);
  }

  for (i = 0; i < stored.links.length; ++i) {
    var link = stored.links[i];
    if (!link.hasOwnProperty('fromId') || !link.hasOwnProperty('toId')) {
      throw 'Graph link format is invalid. Both fromId and toId are required';
    }

    graph.addLink(link.fromId, link.toId, link.data);
  }

  return graph;
}
