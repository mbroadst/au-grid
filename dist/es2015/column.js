var _dec, _dec2, _dec3, _class, _desc, _value, _class2, _descriptor;

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

import { inject } from 'aurelia-dependency-injection';
import { bindable, customElement, noView, processContent, ViewCompiler } from 'aurelia-templating';

export let Column = (_dec = processContent(false), _dec2 = customElement('au-column'), _dec3 = inject(Element, ViewCompiler), noView(_class = _dec(_class = _dec2(_class = _dec3(_class = (_class2 = class Column {

  constructor(element, viewCompiler) {
    _initDefineProp(this, 'header', _descriptor, this);

    let template = `<template>${ element.innerHTML }</template>`;
    this.viewFactory = viewCompiler.compile(template);
    element.innerHTML = '';
  }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'header', [bindable], {
  enumerable: true,
  initializer: null
})), _class2)) || _class) || _class) || _class) || _class);