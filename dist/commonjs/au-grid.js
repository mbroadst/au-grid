'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Column = exports.Grid = undefined;
exports.configure = configure;

var _grid = require('./grid');

var _column = require('./column');

function configure(aurelia) {
  aurelia.globalResources('./grid', './column');
}

exports.Grid = _grid.Grid;
exports.Column = _column.Column;