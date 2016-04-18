import {inject} from 'aurelia-dependency-injection';
import {
  bindable,
  customElement,
  noView,
  processContent,
  ViewCompiler
} from 'aurelia-templating';

@noView
@processContent(false)
@customElement('au-column')
@inject(Element, ViewCompiler)
export class Column {
  @bindable header

  constructor(element, viewCompiler) {
    let template = `<template>${element.innerHTML}</template>`;
    this.viewFactory = viewCompiler.compile(template);
    element.innerHTML = '';
  }
}
