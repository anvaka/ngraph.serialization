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
  createLineParser: createLineParser
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
