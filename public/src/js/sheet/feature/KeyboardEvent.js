import { _ } from '../../util/util';
import { parseCellName } from '../util/parser';
const KEYCODE = {
  TAB: 9,
  ENTER: 13,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETD: 46,
};
class KeyboardEvent {
  constructor({ sheet, model, cellNameBox, functionInput }) {
    this.sheet = sheet;
    this.sheetModel = model;
    this.cellNameBox = cellNameBox;
    this.functionInput = functionInput;
    this.focusedCell;
    this.focusedInput;
    this.init();
  }
  init() {
    this.addEvent();
  }
  addEvent() {
    this.sheet.addEventListener('mousedown', this.handleMousedown.bind(this));
    this.sheet.addEventListener('mouseup', this.handleMousedown.bind(this));
    this.functionInput.addEventListener('keydown', this.handleFnKeydown.bind(this));
    this.sheet.addEventListener('keydown', this.handleSheetKeydown.bind(this));
  }
  handleMousedown({ target }) {
    if (this._isIndexCell(target)) return;
    this._focusCell(target);
  }
  handleSheetKeydown({ keyCode }) {
    this._clearSelectCell();
    if (keyCode === KEYCODE.DELETD) this._handleDelete();
    if (keyCode === KEYCODE.ENTER) this._handleMoveCell({ moveColumn: 0, moveRow: 1 });
    if (keyCode === KEYCODE.TAB) this._handleMoveCell({ moveColumn: 1, moveRow: 0, isTab: true });
    if (keyCode === KEYCODE.LEFT) this._handleMoveCell({ moveColumn: -1, moveRow: 0 });
    if (keyCode === KEYCODE.RIGHT) this._handleMoveCell({ moveColumn: 1, moveRow: 0 });
    if (keyCode === KEYCODE.UP) this._handleMoveCell({ moveColumn: 0, moveRow: -1 });
    if (keyCode === KEYCODE.DOWN) this._handleMoveCell({ moveColumn: 0, moveRow: 1 });
  }
  handleFnKeydown({ keyCode }) {
    if (!this.sheetModel.getFocusInput()) return;
    if (keyCode === KEYCODE.ENTER) this._handleMoveCell({ moveColumn: 0, moveRow: 0 });
  }
  _handleMoveCell(column, row) {
    const selectCell = this.sheetModel.getFocusCell();
    const inputValue = this._getInputValue(selectCell);
    const { column: focusColumn, row: rowColumn } = this._getLocation(selectCell);
    this.sheetModel.setData({ column: focusColumn, row: rowColumn, value: inputValue });
    this._moveFocusedCell(column, row);
    this._setCellNameBox();
    this._setFunctionInput();
  }
  _handleDelete() {
    this._clearInput();
    this._setFunctionInput();
  }
  _focusCell(target) {
    if (this.sheetModel.getFocusCell()) this._removeFocused();
    this._setFocused(target);
    this._addFocused();
    this._setCellNameBox();
    this._setFunctionInput();
  }
  _addFocused() {
    const focusCell = this.sheetModel.getFocusCell();
    focusCell.classList.add('focused');
  }
  _removeFocused() {
    const focusCell = this.sheetModel.getFocusCell();
    focusCell.classList.remove('focused');
  }
  _setFocused(node) {
    if (this._isParentTd(node)) {
      const input = node;
      const cell = node.parentElement;
      this.sheetModel.setFocusData({ cell, input });
    } else {
      const input = node.firstElementChild;
      const cell = node;
      this.sheetModel.setFocusData({ cell, input });
    }
  }
  _setNewFocusedCell(moveColumn, moveRow) {
    const selectCell = this.sheetModel.getFocusCell();
    const { column: focusColumn, row: focusRow } = this._getLocation(selectCell);
    const moveIdx = { column: focusColumn * 1 + moveColumn, row: focusRow * 1 + moveRow };
    if (
      moveIdx.column <= 0 ||
      moveIdx.column > this.sheetModel.maxColumn ||
      moveIdx.row <= 0 ||
      moveIdx.row > this.sheetModel.maxRow
    )
      return;
    const newFocusedCell = _.$td({ x: moveIdx.column, y: moveIdx.row }, this.sheet);
    this._setFocused(newFocusedCell);
  }
  _moveFocusedCell({ moveColumn, moveRow, isTab = false }) {
    if (!isTab) this._focusOutInput();
    this._removeFocused();
    this._setNewFocusedCell(moveColumn, moveRow);
    if (!isTab) this._focusInput();
    this._addFocused();
  }
  _isParentTd(node) {
    return node.parentElement.tagName === 'TD';
  }
  _focusInput() {
    const input = this.sheetModel.getFocusInput();
    input.focus();
  }
  _focusOutInput() {
    const input = this.sheetModel.getFocusInput();
    input.blur();
  }
  _clearInput() {
    const input = this.sheetModel.getFocusInput();
    input.value = '';
  }
  _setInputValue(value) {
    const input = this.sheetModel.getFocusInput();
    input.value = value;
  }
  _getInputValue() {
    const input = this.sheetModel.getFocusInput();
    return input.value;
  }
  _getLocation(node) {
    const { attributes } = node;
    return { column: attributes.x.value, row: attributes.y.value };
  }
  _setCellNameBox() {
    const selectCell = this.sheetModel.getFocusCell();
    const { column, row } = this._getLocation(selectCell);
    const cellName = parseCellName(column, row);
    this.cellNameBox.innerHTML = cellName;
  }
  _setFunctionInput() {
    const seleceInput = this.sheetModel.getFocusInput();
    const value = seleceInput.value;
    this.functionInput.value = value;
  }
  _isIndexCell(node) {
    const nodeParent = node.parentElement;
    return node.classList.contains('row-index') || nodeParent.classList.contains('column-index');
  }
  _clearSelectCell() {
    const selectData = this.sheetModel.getSelectData();
    selectData.forEach(({ cell, input }) => {
      this._removeSelected(cell);
      this._removeSelected(input);
      this._removeBorder(cell);
    });
    this.sheetModel.clearSelectData();
  }
  _removeSelected(node) {
    node.classList.remove('selected');
  }
  _removeBorder(node) {
    const solidBorderList = ['top-solid', 'bottom-solid', 'right-solid', 'left-solid'];
    node.classList.remove(...solidBorderList);
  }
}

export default KeyboardEvent;
