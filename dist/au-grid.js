import {createOverrideContext,BindingBehavior,ValueConverter,sourceContext,bindingMode,ObserverLocator} from 'aurelia-binding';
import {inject,Container} from 'aurelia-dependency-injection';
import {bindable,customElement,noView,processContent,ViewCompiler,children,ViewSlot} from 'aurelia-templating';
import {AbstractRepeater,RepeatStrategyLocator} from 'aurelia-templating-resources';

const oneTime = bindingMode.oneTime;

/**
* Update the override context.
* @param startIndex index in collection where to start updating.
*/
export function updateOverrideContexts(views, startIndex) {
  let length = views.length;

  if (startIndex > 0) {
    startIndex = startIndex - 1;
  }

  for (; startIndex < length; ++startIndex) {
    updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
  }
}

/**
  * Creates a complete override context.
  * @param data The item's value.
  * @param index The item's index.
  * @param length The collections total length.
  * @param key The key in a key/value pair.
  */
export function createFullOverrideContext(repeat, data, index, length, key) {
  let bindingContext = {};
  let overrideContext = createOverrideContext(bindingContext, repeat.scope.overrideContext);
  // is key/value pair (Map)
  if (typeof key !== 'undefined') {
    bindingContext[repeat.key] = key;
    bindingContext[repeat.value] = data;
  } else {
    bindingContext[repeat.local] = data;
  }
  updateOverrideContext(overrideContext, index, length);
  return overrideContext;
}

/**
* Updates the override context.
* @param context The context to be updated.
* @param index The context's index.
* @param length The collection's length.
*/
export function updateOverrideContext(overrideContext, index, length) {
  let first = (index === 0);
  let last = (index === length - 1);
  let even = index % 2 === 0;

  overrideContext.$index = index;
  overrideContext.$first = first;
  overrideContext.$last = last;
  overrideContext.$middle = !(first || last);
  overrideContext.$odd = !even;
  overrideContext.$even = even;
}

/**
* Gets a repeat instruction's source expression.
*/
export function getItemsSourceExpression(instruction, attrName) {
  return instruction.behaviorInstructions
    .filter(bi => bi.originalAttrName === attrName)[0]
    .attributes
    .items
    .sourceExpression;
}

/**
* Unwraps an expression to expose the inner, pre-converted / behavior-free expression.
*/
export function unwrapExpression(expression) {
  let unwrapped = false;
  while (expression instanceof BindingBehavior) {
    expression = expression.expression;
  }
  while (expression instanceof ValueConverter) {
    expression = expression.expression;
    unwrapped = true;
  }
  return unwrapped ? expression : null;
}

/**
* Returns whether an expression has the OneTimeBindingBehavior applied.
*/
export function isOneTime(expression) {
  while (expression instanceof BindingBehavior) {
    if (expression.name === 'oneTime') {
      return true;
    }
    expression = expression.expression;
  }
  return false;
}

/**
* Forces a binding instance to reevaluate.
*/
export function updateOneTimeBinding(binding) {
  if (binding.call && binding.mode === oneTime) {
    binding.call(sourceContext);
  } else if (binding.updateOneTimeBindings) {
    binding.updateOneTimeBindings();
  }
}

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

@customElement('au-grid')
@inject(Container, ViewSlot, ViewCompiler, ObserverLocator, RepeatStrategyLocator)
export class Grid extends AbstractRepeater {
  @children('au-column') columns;
  @bindable rows;
  @bindable class;

  columnViewFactories = [];

  constructor(container, viewSlot, viewCompiler, observerLocator, strategyLocator) {
    super({
      local: 'row',
      viewsRequireLifecycle: false
    });

    this.container = container;
    this.viewSlot = viewSlot;
    this.observerLocator = observerLocator;
    this.strategyLocator = strategyLocator;
    this.scope = null;
    this.strategy = null;
    this.rowViewFactory =
      viewCompiler.compile(`<template><content></content></template`);

    this.rowViewSlots = [];
  }

  // life-cycle business
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

  // view related
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

  // collection observation
  _stopObservation() {
    if (this.collectionObserver) {
      this.collectionObserver.unsubscribe(this.callContext, this);
      this.collectionObserver = null;
      this.callContext = null;
    }
  }

  _observeCollection() {
    let rows = this.rows;
    this.collectionObserver =
      this.strategy.getCollectionObserver(this.observerLocator, rows);

    if (this.collectionObserver) {
      this.callContext = 'handleCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
    }
  }

  handleCollectionMutated(collection, changes) {
    this.strategy.instanceMutated(this, collection, changes);
  }

  // @override AbstractRepeater
  views() { return this.rowViewSlots; }
  view(index) { return this.rowViewSlots[index]; }
  viewCount() { return this.rowViewSlots.length; }

  addView(bindingContext, overrideContext) {
    // console.log('addView(bctx= ', bindingContext, ')');
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

      // move the view to the `td` element
      cellView.removeNodes();
      cellView.appendNodesTo(cellElement);
    }

    rowViewSlot.bind(bindingContext, overrideContext);
    this.rowViewSlots.push(rowViewSlot);
  }

  insertView(index, bindingContext, overrideContext) {
    // console.log('insertView(index=', index, ', bctx= ', bindingContext, ')');
    let rowElement = document.createElement('tr');
    let existingElement =
      (!!this.rowViewSlots[index] && !!this.rowViewSlots[index].anchor) ?
      this.rowViewSlots[index].anchor : null;
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

      // move the view to the `td` element
      cellView.removeNodes();
      cellView.appendNodesTo(cellElement);
    }

    rowViewSlot.bind(bindingContext, overrideContext);
    this.rowViewSlots.splice(index, 0, rowViewSlot);
  }

  removeAllViews() {
    // console.log('removeAllViews()');
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
    // console.log('removeView(index=', index, ')');
    let rowViewSlots = this.rowViewSlots;
    let anchor = rowViewSlots[index].anchor;
    let parentNode = anchor.parentNode;
    rowViewSlots[index].removeAll(true);
    parentNode.removeChild(anchor);
    rowViewSlots.splice(index, 1);
    this.viewSlot.removeAt(index, true);
  }

  updateBindings(view) {
    // console.log('updateBindings(view=', view, ')');
    let i = view.children.length;
    while (i--) {
      let j = view.children[i].bindings.length;
      while (j--) updateOneTimeBinding(view.children[i].bindings[j]);

      j = view.children[i].controllers.length;
      while (j--) {
        let k = view.children[i].controllers[j].boundProperties.length;
        while (k--) {
          let binding =
            view.children[i].controllers[j].boundProperties[k].binding;
          updateOneTimeBinding(binding);
        }
      }
    }
  }
}

export function configure(aurelia) {
  aurelia.globalResources(
    './grid',
    './column'
  );
}

export { Grid, Column };
