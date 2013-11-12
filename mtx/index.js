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
  saveToObject: saveToObject
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

  return mtxParser.getGraph();
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
      };

  graph.forEachLink(function (link) {
    if (typeof link.fromId !== 'number' || typeof link.toId !== 'number') {
      throw new Error('saveToObject can only work with numbers as node ids.');
    }
    links.push(link.fromId);
    links.push(link.toId);
    if (includeData) {
      if (typeof link.data !== 'number') {
        // forgive or throw?
        throw new Error('Links data should be a number');
      }
      links.push(link.data);
    }
  });

  return savedObject;
}
