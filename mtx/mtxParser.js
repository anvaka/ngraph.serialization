/**
 * # MTX Parser
 *
 * This is very naive implementation of [Matrix Market format](http://math.nist.gov/MatrixMarket/formats.html)
 * parser;
 *
 * _NOTE_: Current implementation intentionally treats loops as node associated data.
 *
 * Example of Matrix market fomrat:
 *
 * ```
 * %%MatrixMarket matrix coordinate real general
 * %=================================================================================
 * %
 * % This ASCII file represents a sparse MxN matrix with L
 * % nonzeros in the following Matrix Market format:
 * %
 * % +----------------------------------------------+
 * % |%%MatrixMarket matrix coordinate real general | <--- header line
 * % |%                                             | <--+
 * % |% comments                                    |    |-- 0 or more comment lines
 * % |%                                             | <--+
 * % |    M  N  L                                   | <--- rows, columns, entries
 * % |    I1  J1  A(I1, J1)                         | <--+
 * % |    I2  J2  A(I2, J2)                         |    |
 * % |    I3  J3  A(I3, J3)                         |    |-- L lines
 * % |        . . .                                 |    |
 * % |    IL JL  A(IL, JL)                          | <--+
 * % +----------------------------------------------+
 * %
 * % Indices are 1-based, i.e. A(1,1) is the first element.
 * %
 * %=================================================================================
 *   5  5  8
 *     1     1   1.000e+00
 *     2     2   1.050e+01
 *     3     3   1.500e-02
 *     1     4   6.000e+00
 *     4     2   2.505e+02
 *     4     4  -2.800e+02
 *     4     5   3.332e+01
 *     5     5   1.200e+01
 * ```
 */
module.exports = mtxParser;

var createGraph = require('ngraph.graph'),
    dataSeparator = /\s+/,
// Parser has only two states:
    WAIT_ROW_COLUMNS_ENTRIES = 0,
    READ_DATA = 1;

function mtxParser() {
  var graph = createGraph(),
      description = [],
      stats = { rows: 0, columns: 0, nonZero: 0 },
      state = WAIT_ROW_COLUMNS_ENTRIES;

  return {
    getGraph: function () {
      return graph;
    },
    getDescription: function () {
      return description;
    },
    parse: parse
  };

  function parse(line) {
    if (!line) {
      return; // forgive empty lines
    }
    if (line[0] === '%') {
      // We are reading description of a file:
      description.push(line.slice(1));
      return;
    }
    var data = getLineData(line);
    if (state === READ_DATA) {
      // Node ids represent columns and rows, thus they are always integers:
      var from = parseInt(data[0], 10),
          to = parseInt(data[1], 10),
          value = data[2] !== undefined ? parseFloat(data[2]) : undefined;

      // Currently we do not support loops. Treat this as simple node
      if (from === to) {
        graph.addNode(from, value);
      } else {
        graph.addLink(from, to, value);
      }
    } else if (state === WAIT_ROW_COLUMNS_ENTRIES) {
      // Now we know how many rows/columns we should expect
      stats.rows = parseInt(data[0], 10);
      stats.columns = parseInt(data[1], 10);
      stats.nonZero = parseInt(data[2], 10);

      // From now on we should wait only data
      state = READ_DATA;
    }
  }
}

var trailingWhitespaces = /^\s+|\s+$/;

function getLineData(line) {
  return line.replace(trailingWhitespaces, '').split(dataSeparator);
}
