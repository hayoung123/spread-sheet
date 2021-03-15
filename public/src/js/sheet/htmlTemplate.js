import { createDom } from '../util/util';

export const td = createDom('td');
export const tr = createDom('tr');

export const makeShellHTML = () => td({ value: '<input type="text" />' });
export const makeRowIndexHTML = (idx) => td({ value: idx, classes: ['row-index'] });
