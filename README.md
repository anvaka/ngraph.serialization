ngraph.serialization
====================

This library provides serialization and deserialization of a graph into various formats.
Currently supported formats are:

* JSON -  is the most readable and simple graph storage format. Main
drawback of this format is its size - for large graph due to verbosity
of the format it can take more space then it could.
* [Matrix market format](http://math.nist.gov/MatrixMarket/formats.html) is a
format suitable for representing general sparse matrices. Only nonzero entries
are provided, and the coordinates of each nonzero entry is given explicitly.
Most notably this format is used to store
[University of Florida Sparse Matrix Collection](http://www.cise.ufl.edu/research/sparse/matrices/index.html)

You can also use specialized serializers:

* [ngraph.fromdot](github.com/anvaka/ngraph.fromdot) - load graph from DOT format
* [ngraph.todot](github.com/anvaka/ngraph.todot) - saves graph as DOT format
* [ngraph.fromjson](github.com/anvaka/ngraph.fromjson) - load graph from JSON format
* [ngraph.tojson](github.com/anvaka/ngraph.tojson) - saves graph as JSON format
