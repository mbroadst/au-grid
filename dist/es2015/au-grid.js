import { Grid } from './grid';
import { Column } from './column';

export function configure(aurelia) {
  aurelia.globalResources('./grid', './column');
}

export { Grid, Column };