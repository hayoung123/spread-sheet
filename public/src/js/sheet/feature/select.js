import { _ } from '../../util/util';

class Select {
  constructor(sheet, sheetModel) {
    this.sheet = sheet;
    this.sheetModel = sheetModel;
    this.isSelectMousedown = false;
    this.isDropMousedown = false;
    this.selectIdx = {};
    this.dropIdx = {};
    this.checkData = {};
    this.beforeSelectData = [];
    this.selectData = [];
    this.dropData = [];
    this.startDropIdx = {};
    this.endDropIdx = {};
    this.init();
  }
  init() {
    this.addEvent();
  }
  addEvent() {
    this.sheet.addEventListener('mousedown', this.handleMousedown.bind(this));
    this.sheet.addEventListener('mouseover', this.handleMouseover.bind(this));
    this.sheet.addEventListener('mouseup', this.handleMouseup.bind(this));
  }
  handleMousedown({ target }) {
    if (this._isParentTd(target)) this._dragSelectMousedown(target);
    // else this._dragDropMousedown(target);
  }
  handleMouseover({ target }) {
    if (this.isSelectMousedown && this._isParentTd(target)) this._dragSelectMouseover(target);
    // if (this.isDropMousedown) this._dragDropMouseover(target);
  }
  handleMouseup({ target }) {
    if (this.isSelectMousedown) this._dragSelectMouseup(target);
    // if (this.isDropMousedown) this._dragDropMouseup(target);
  }
  _dragSelectMousedown(target) {
    this._toggleSelectStatus();
    this._clearCheckCells();
    this._setStartIdx(target);
    this._setEndIdx(target); //start 및 end index setting
    this._setCheckIdx(); // check(start~end)인덱스 세팅
    this._setSelectData(); //check인덱스 바탕으로 selectData세팅
    this._selectCell(this.selectData); //select
  }
  _dragSelectMouseover(target) {
    const targetCell = target.parentElement;
    this._clearCheckCells();
    this._setEndIdx(targetCell); //end index setting
    this._setCheckIdx(); // check(start~end)인덱스 세팅
    this._setSelectData(); //check인덱스 바탕으로 selectData세팅
    this._selectCell(this.selectData); //select
  }
  _dragSelectMouseup(target) {
    this._toggleSelectStatus();
    this._setEndIdx(target); //end index setting
    this._setCheckIdx(); // check(start~end)인덱스 세팅
    this._setSelectData(); //check인덱스 바탕으로 selectData세팅
  }
  _dragDropMousedown(target) {
    this._toggleDropStatus();
    this._setStartDropIdx(target);
  }
  _dragDropMouseover(target) {
    //border
  }
  _dragDropMouseup(target) {
    this._toggleDropStatus();
    this._clearCheckCells();
    this._setEndDropIdx(target);
    const moveIndex = this._getMoveDropIdx();
    this._setDropData(moveIndex);
    this._selectCell(this.dropData);
    this.beforeSelectData = this.selectData;
    this._updateSelectData(moveIndex);
  }
  _selectCell(selectData) {
    selectData.forEach((node) => {
      const { column, row } = node;
      const selectCell = _.$td({ x: column, y: row }, this.sheet);
      this._addSelected(selectCell);
    });
  }
  _isParentTd(node) {
    return node.parentElement.tagName === 'TD';
  }
  _addSelected(node) {
    node.classList.add('selected');
    node.firstElementChild.classList.add('selected');
  }
  _removeSelected(node) {
    node.classList.remove('selected');
    node.firstElementChild.classList.remove('selected');
  }
  _setStartIdx(target) {
    if (this._isParentTd(target)) target = target.parentElement;
    const { attributes } = target;
    this.selectIdx.start = { column: attributes.x.value, row: attributes.y.value };
  }
  _setEndIdx(target) {
    if (this._isParentTd(target)) target = target.parentElement;
    const { attributes } = target;
    this.selectIdx.end = { column: attributes.x.value, row: attributes.y.value };
  }
  _clearCheckCells() {
    const { start, end } = this.checkData;
    if (!start || !end) return;
    this._setSelectData();
    this.selectData.forEach((node) => {
      const { column, row } = node;
      const checkCell = _.$td({ x: column, y: row }, this.sheet);
      this._removeSelected(checkCell);
    });
    this.beforeSelectData.forEach((node) => {
      const { column, row } = node;
      const checkCell = _.$td({ x: column, y: row }, this.sheet);
      this._removeSelected(checkCell);
    });
  }
  _makeBlockCellIdx(start, end) {
    const blockCellIdxList = [];
    const { column: startColumn, row: startRow } = start;
    const { column: endColumn, row: endRow } = end;
    const [minColumn, maxColumn] = [
      Math.min(startColumn, endColumn),
      Math.max(startColumn, endColumn),
    ];
    const [minRow, maxRow] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
    for (let column = minColumn; column <= maxColumn; column++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cellIdx = { column, row };
        blockCellIdxList.push(cellIdx);
      }
    }
    return blockCellIdxList;
  }
  _setCheckIdx() {
    const { start, end } = this.selectIdx;
    const [minColumn, maxColumn] = [
      Math.min(start.column, end.column),
      Math.max(start.column, end.column),
    ];
    const [minRow, maxRow] = [Math.min(start.row, end.row), Math.max(start.row, end.row)];
    this.checkData.start = {
      column: minColumn > 10 ? minColumn - 10 : 0,
      row: minRow > 10 ? minRow - 10 : 0,
    };
    this.checkData.end = {
      column: maxColumn + 10,
      row: maxRow + 10,
    };
  }
  _setSelectData() {
    const { start, end } = this.selectIdx;
    this.selectData = this._makeBlockCellIdx(start, end);
  }
  _updateSelectData(moveIdx) {
    const { start, end } = this.selectIdx;
    const { moveColumn, moveRow } = moveIdx;
    start.column += moveColumn;
    end.column += moveColumn;
    start.row += moveRow;
    end.row += moveRow;
  }
  getSelectData() {
    return this.selectData;
  }
  _setStartDropIdx(target) {
    const { attributes } = target;
    this.dropIdx.start = { column: attributes.x.value, row: attributes.y.value };
  }
  _setEndDropIdx(target) {
    if (this._isParentTd(target)) target = target.parentElement;
    const { attributes } = target;
    this.dropIdx.end = { column: attributes.x.value, row: attributes.y.value };
  }
  _setDropData(moveIdx) {
    const { column: moveColumn, row: moveRow } = moveIdx;
    this.dropData = this.selectData.map((location) => {
      const { column, row } = location;
      return { column: column + moveColumn, row: row + moveRow };
    });
  }
  _getMoveDropIdx() {
    const { start, end } = this.dropIdx;
    const moveColumn = end.column - start.column;
    const moveRow = end.row - start.row + 1;
    return { column: moveColumn, row: moveRow };
  }
  _toggleSelectStatus() {
    this.isSelectMousedown = !this.isSelectMousedown;
  }
  _toggleDropStatus() {
    this.isDropMousedown = !this.isDropMousedown;
  }
}

export default Select;
