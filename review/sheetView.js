import { makeRowIndexHTML, makeShellHTML, td, tr } from './htmlTemplate.js';
import SheetModel from './sheetModel';
import SelectEvent from './feature/selectEvent.js';
import { add, _ } from '../util/util.js';
import KeyboardEvent from './feature/keyboardEvent.js';
import InputEvent from './feature/inputEvent.js';
class SheetView {
  constructor(sheet) {
    this.sheet = sheet;
    this.sheetModel = new SheetModel();
    this.cellNameBox = _.$('.namebox');
    this.functionInput = _.$('.function-box>input');
  }
  init() {
    this.render();
    const keyboardEvent = new KeyboardEvent({
      sheet: this.sheet,
      model: this.sheetModel,
      cellNameBox: this.cellNameBox,
      functionInput: this.functionInput,
    });
    const inputEvent = new InputEvent({
      sheet: this.sheet,
      model: this.sheetModel,
      cellNameBox: this.cellNameBox,
      functionInput: this.functionInput,
    });
    const selectEvent = new SelectEvent({
      sheet: this.sheet,
      model: this.sheetModel,
      cellNameBox: this.cellNameBox,
    });
  }
  _makeColumnIndex() {
    const columnIndexList = this.sheetModel
      .getColumnIndex()
      .map((value) => td({ value }))
      .reduce(add, '');
    const columnIndxHTML = tr({ value: columnIndexList, classes: ['column-index'] });
    return columnIndxHTML;
  }
  _makeRowSheet(arr, row) {
    const rowSheet = arr
      .map((value, column) =>
        column ? makeShellHTML({ x: column, y: row }) : makeRowIndexHTML(value)
      )
      .reduce(add, '');
    const rowSheetHTML = tr({ value: rowSheet });
    return rowSheetHTML;
  }
  _makeSheet() {
    const sheetHTML = this.sheetModel
      .getSheetData()
      .slice(1)
      .map((rowData, row) => this._makeRowSheet(rowData, row + 1));
    return sheetHTML.join('');
  }
  render() {
    const ColumnIndex = this._makeColumnIndex();
    const sheetHTML = this._makeSheet();
    this.sheet.innerHTML = ColumnIndex + sheetHTML;
  }
}

export default SheetView;
