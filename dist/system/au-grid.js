'use strict';

System.register(['./grid', './column'], function (_export, _context) {
  var Grid, Column;
  return {
    setters: [function (_grid) {
      Grid = _grid.Grid;
    }, function (_column) {
      Column = _column.Column;
    }],
    execute: function () {
      function configure(aurelia) {
        aurelia.globalResources('./grid', './column');
      }

      _export('configure', configure);

      _export('Grid', Grid);

      _export('Column', Column);
    }
  };
});