var _dec, _dec2, _dec3, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3;

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

import { inject, Container } from 'aurelia-dependency-injection';
import { bindable, children, customElement, ViewCompiler, ViewSlot } from 'aurelia-templating';
import { ObserverLocator } from 'aurelia-binding';
import { AbstractRepeater, RepeatStrategyLocator } from 'aurelia-templating-resources';
import { updateOneTimeBinding } from './grid-utilities';

export let Grid = (_dec = customElement('au-grid'), _dec2 = inject(Container, ViewSlot, ViewCompiler, ObserverLocator, RepeatStrategyLocator), _dec3 = children('au-column'), _dec(_class = _dec2(_class = (_class2 = class Grid extends AbstractRepeater {

  constructor(container, viewSlot, viewCompiler, observerLocator, strategyLocator) {
    super({
      local: 'row',
      viewsRequireLifecycle: false
    });

    _initDefineProp(this, 'columns', _descriptor, this);

    _initDefineProp(this, 'rows', _descriptor2, this);

    _initDefineProp(this, 'class', _descriptor3, this);

    this.columnViewFactories = [];
    this.container = container;
    this.viewSlot = viewSlot;
    this.observerLocator = observerLocator;
    this.strategyLocator = strategyLocator;
    this.scope = null;
    this.strategy = null;
    this.rowViewFactory = viewCompiler.compile(`<template><content></content></template`);

    this.rowViewSlots = [];
  }

  bind(bindingContext, overrideContext) {
    this.scope = { bindingContext, overrideContext };
    this.scrapeColumnViewFactories();
    this.renderHeaders();
    this.rowsChanged();
  }

  unbind() {
    this.scope = null;
    this.rows = null;
    this.viewSlot.removeAll(true);
    this._stopObservation();
  }

  call(context, changes) {
    this[context](this.rows, changes);
  }

  scrapeColumnViewFactories() {
    for (let i = 0, ii = this.columns.length; i < ii; ++i) {
      this.columnViewFactories.push(this.columns[i].viewFactory);
    }
  }

  renderHeaders() {
    let headers = this.columns.map(c => c.header);
    for (let i = 0; i < headers.length; ++i) {
      let headerElement = document.createElement('th');
      let headerNode = document.createTextNode(headers[i]);
      headerElement.appendChild(headerNode);
      this.header.appendChild(headerElement);
    }
  }

  rowsChanged() {
    this._stopObservation();
    if (!this.scope) return;

    let rows = this.rows;
    this.strategy = this.strategyLocator.getStrategy(rows);
    this._observeCollection();
    this.strategy.instanceChanged(this, rows);
  }

  _stopObservation() {
    if (this.collectionObserver) {
      this.collectionObserver.unsubscribe(this.callContext, this);
      this.collectionObserver = null;
      this.callContext = null;
    }
  }

  _observeCollection() {
    let rows = this.rows;
    this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, rows);

    if (this.collectionObserver) {
      this.callContext = 'handleCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
    }
  }

  handleCollectionMutated(collection, changes) {
    this.strategy.instanceMutated(this, collection, changes);
  }

  views() {
    return this.rowViewSlots;
  }
  view(index) {
    return this.rowViewSlots[index];
  }
  viewCount() {
    return this.rowViewSlots.length;
  }

  addView(bindingContext, overrideContext) {
    let rowElement = document.createElement('tr');
    this.tbody.appendChild(rowElement);
    let rowView = this.rowViewFactory.create(this.container);
    this.viewSlot.add(rowView);
    let rowViewSlot = new ViewSlot(rowElement, true);
    for (let x = 0, xx = this.columnViewFactories.length; x < xx; x++) {
      let cellViewFactory = this.columnViewFactories[x];
      let cellView = cellViewFactory.create(this.container);
      rowViewSlot.add(cellView);

      let cellElement = document.createElement('td');
      rowElement.appendChild(cellElement);

      cellView.removeNodes();
      cellView.appendNodesTo(cellElement);
    }

    rowViewSlot.bind(bindingContext, overrideContext);
    this.rowViewSlots.push(rowViewSlot);
  }

  insertView(index, bindingContext, overrideContext) {
    let rowElement = document.createElement('tr');
    let existingElement = !!this.rowViewSlots[index] && !!this.rowViewSlots[index].anchor ? this.rowViewSlots[index].anchor : null;
    this.tbody.insertBefore(rowElement, existingElement);
    let rowView = this.rowViewFactory.create(this.container);
    this.viewSlot.insert(index, rowView);
    let rowViewSlot = new ViewSlot(rowElement, true);
    for (let x = 0, xx = this.columnViewFactories.length; x < xx; x++) {
      let cellViewFactory = this.columnViewFactories[x];
      let cellView = cellViewFactory.create(this.container);
      rowViewSlot.add(cellView);

      let cellElement = document.createElement('td');
      rowElement.appendChild(cellElement);

      cellView.removeNodes();
      cellView.appendNodesTo(cellElement);
    }

    rowViewSlot.bind(bindingContext, overrideContext);
    this.rowViewSlots.splice(index, 0, rowViewSlot);
  }

  removeAllViews() {
    let length = this.rowViewSlots.length;
    while (length--) {
      let rowViewSlot = this.rowViewSlots.pop();
      let anchor = rowViewSlot.anchor;
      let parentNode = anchor.parentNode;
      rowViewSlot.removeAll(true);
      parentNode.removeChild(anchor);
    }

    this.rowViewSlots = [];
    this.viewSlot.removeAll(true);
  }

  removeView(index) {
    let rowViewSlots = this.rowViewSlots;
    let anchor = rowViewSlots[index].anchor;
    let parentNode = anchor.parentNode;
    rowViewSlots[index].removeAll(true);
    parentNode.removeChild(anchor);
    rowViewSlots.splice(index, 1);
    this.viewSlot.removeAt(index, true);
  }

  updateBindings(view) {
    let i = view.children.length;
    while (i--) {
      let j = view.children[i].bindings.length;
      while (j--) updateOneTimeBinding(view.children[i].bindings[j]);

      j = view.children[i].controllers.length;
      while (j--) {
        let k = view.children[i].controllers[j].boundProperties.length;
        while (k--) {
          let binding = view.children[i].controllers[j].boundProperties[k].binding;
          updateOneTimeBinding(binding);
        }
      }
    }
  }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'columns', [_dec3], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'rows', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'class', [bindable], {
  enumerable: true,
  initializer: null
})), _class2)) || _class) || _class);