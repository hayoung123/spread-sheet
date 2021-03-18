import { _ } from '../../util/util';

class InputEvent {
  constructor({ sheet, cellNameBox, model, functionInput }) {
    this.sheet = sheet;
    this.nameBox = cellNameBox;
    this.sheetModel = model;
    this.functionInput = functionInput;
    this.calculateData = [];
    this.init();
  }
  init() {
    this.addEvent();
  }
  addEvent() {
    this.functionInput.addEventListener('input', this.handleFnInput.bind(this));
    this.sheet.addEventListener('input', this.handleSheetInput.bind(this));
  }
  handleFnInput({ target }) {
    if (!this.sheetModel.getFocusCell()) return;
    if (this._isFunction()) this._executeFunction();
    else this._setSheetInputValue();
  }
  handleSheetInput({ target }) {
    if (!this._isParentTd(target)) return;
    this._setFunctionInputValue();
  }
  _executeFunction() {
    const functionvalue = this.functionInput.value.slice(1);
    //계산하는 부분
  }
  //A5 => A행 5열에 있는 value가져오기
  _getparsedValue(location) {
    const [columnChar, rowChar] = [location.replace(/[0-9]/g, ''), location.replace(/[^0-9]/g, '')];
    const column = this._getColumnIdx(columnChar);
    const row = rowChar * 1;
  }
  _getColumnIdx(char) {
    return char.charCodeAt() - 'A'.charCodeAt() + 1;
  }
  _isParentTd(node) {
    return node.parentElement.tagName === 'TD';
  }
  _setFunctionInputValue() {
    const selectInput = this.sheetModel.getFocusInput();
    this.functionInput.value = selectInput.value;
  }
  _setSheetInputValue() {
    const selectInput = this.sheetModel.getFocusInput();
    selectInput.value = this.functionInput.value;
  }
  _isFunction() {
    return this.functionInput.value[0] === '=';
  }
}

export default InputEvent;
