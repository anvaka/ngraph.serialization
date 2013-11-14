/**
 * # Matrix Market storage
 *
 * [Matrix market format](http://math.nist.gov/MatrixMarket/formats.html) is a
 * format suitable for representing general sparse matrices. Only nonzero entries
 * are provided, and the coordinates of each nonzero entry is given explicitly.
 *
 * Most notably this format is used to store [University of Florida Sparse Matrix
 * Collection](http://www.cise.ufl.edu/research/sparse/matrices/index.html)
 */

module.exports = {
  load: load,
  createLineParser: createLineParser,
  saveToObject: saveToObject,
  loadFromObject: loadFromObject
};


/**
 * If you have *.mtx file loaded in memory, pass it to this function to parse
 * it into graph object;
 *
 * Example:
 * ```
 *   fs.readFile(filename, 'ascii', function(err, mtxFileContent) {
 *    if (err) throw err;
 *
 *    var mtx = require('ngraph.serialization/mtx');
 *    var graph = mtx.load(mtxFileContent);
 *    // Now you have graph object.
 *  });
 * ```
 */
function load (mtxText) {
  // This is not very efficient, but hey, let me know if you are using this
  // I'll make it better.
  var mtxLines = mtxText.split('\n'),
      mtxParser = createLineParser();

  mtxLines.forEach(function (line) {
    mtxParser.parse(line);
  });

  var graph = mtxParser.getGraph();
  graph.description = mtxParser.getDescription();

  return graph;
}

/**
 * If you want streaming parsing, you can create MTX line parser, and
 * feed MTX file line by line. Call parser.getGraph() at the end to get actual graph
 *
 * Example:
 *
 * ```
 *  // We use `lazy` (https://github.com/pkrumins/node-lazy) module to read file
 *  // line by line:
 *  var mtxParser = require('ngraph.serialization/mtx').createLineParser(),
 *      mtxFileStream = fs.createReadStream(mtxFileName)
 *          .on('end', function () {
 *            // Your graph is ready:
 *            var graph = mtxParser.getGraph();
 *          }),
 *      lazy = require('lazy');
 *  lazy(mtxFileStream).lines.forEach(function (line) {
 *    mtxParser.parse(line.toString());
 *  });
 * ```
 */
function createLineParser() {
  var createMtxParser = require('./mtxParser');
  return createMtxParser();
}

/**
 * This function saves graph into object with the following fields:
 *  `edges` - array of edges written in a row.
 *  `dimension` - number of elements in `edges` array per edge
 *
 * Each edge record in the array includes `from` and `to` ids (which are numbers)
 * If `includeData` is truthy then each record will also include data associated
 * with link
 */
function saveToObject (graph, includeData) {
  if (!graph) {
    throw new Error('Graph is required to saveArray method');
  }
  includeData = (includeData === undefined) || !!includeData;
  var links = [],
      savedObject = {
        recordsPerEdge: includeData ? 3 : 2,
        links: links
      },
      canChangeIncludeData = true;

  graph.forEachLink(function (link) {
    if (typeof link.fromId !== 'number' || typeof link.toId !== 'number') {
      throw new Error('saveToObject can only work with numbers as node ids.');
    }
    links.push(link.fromId);
    links.push(link.toId);
    if (includeData) {
      if (typeof link.data !== 'number') {
        if (canChangeIncludeData) {
          includeData = false;
          // we actually don't have any data associated with links.
          // change our mind:
          savedObject.recordsPerEdge = 2;
          return;
        } else {
          throw new Error('Some links are missing data');
        }
      }
      // we can only change includeData once:
      canChangeIncludeData = false;
      links.push(link.data);
    }
  });

  return savedObject;
}

/**
 * This function creates a graph structure from mtx object. An mtx object
 * is a return value from saveToObject() method, described above.
 *
 * @returns {ngraph.graph}
 */
function loadFromObject (mtxObject) {
  var mtxObjectIsValid = mtxObject && typeof mtxObject.recordsPerEdge === 'number'
                         && mtxObject.links !== undefined;
  if (!mtxObjectIsValid) {
    throw new Error('Unexpected mtxObject passed to loadFromObject() method');
  }
  var recordsPerEdge = mtxObject.recordsPerEdge,
      links = mtxObject.links;

  if (links.length % recordsPerEdge !== 0) {
    throw new Error('Number of edges is not valid for this object');
  }

  var createGraph = require('ngraph.graph'),
      graph = createGraph(),
      from, to, data;

  for (var i = 0; i < links.length; i += recordsPerEdge) {
    from = links[i];
    to = links[i + 1];
    if (recordsPerEdge === 3) {
      data = links[i + 2];
    }
    graph.addLink(from, to , data);
  }
  graph.description = mtxObject.description;

  return graph;
}
