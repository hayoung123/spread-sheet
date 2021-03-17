import { _ } from '../../util/util';

class SelectEvent {
  constructor({ sheet, model, cellNameBox }) {
    this.sheet = sheet;
    this.sheetModel = model;
    this.cellNameBox = cellNameBox;
    this.isSelectMousedown = false;
    this.isDropMousedown = false;
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
    if (this._isIndexCell(target)) return;
    this._dragSelectMousedown(target);
  }
  handleMouseover({ target }) {
    if (this.isSelectMousedown && this._isParentTd(target)) this._dragSelectMouseover(target);
  }
  handleMouseup({ target }) {
    if (this.isSelectMousedown) this._dragSelectMouseup(target);
  }
  _dragSelectMousedown(target) {
    this._toggleSelectStatus();
    this._clearSelectCell();
    this._setFirstSelectData(target);
    this._setSelectData();
    this._selectCell();
  }
  _dragSelectMouseover(target) {
    this._clearSelectCell();
    this._addSelectData(target);
    this._setSelectData();
    this._selectCell();
  }
  _dragSelectMouseup(target) {
    this._toggleSelectStatus();
  }
  _selectCell() {
    const selectData = this.sheetModel.getSelectData();
    selectData.forEach(({ cell, input }) => {
      this._addSelected(cell);
      this._addSelected(input);
    });
  }
  _isParentTd(node) {
    return node.parentElement.tagName === 'TD';
  }
  _addSelected(node) {
    node.classList.add('selected');
  }
  _removeSelected(node) {
    node.classList.remove('selected');
  }
  _setFirstSelectData(node) {
    if (this._isParentTd(node)) {
      const input = node;
      const cell = node.parentElement;
      this.sheetModel.setSelectData([{ cell, input }]);
    } else {
      const input = node.firstElementChild;
      const cell = node;
      this.sheetModel.setSelectData([{ cell, input }]);
    }
  }
  _addSelectData(node) {
    if (this._isParentTd(node)) {
      const input = node;
      const cell = node.parentElement;
      this.sheetModel.addSelectData({ cell, input });
    } else {
      const input = node.firstElementChild;
      const cell = node;
      this.sheetModel.addSelectData({ cell, input });
    }
  }
  //select cell들 .selected 클래스 제거
  _clearSelectCell() {
    const selectData = this.sheetModel.getSelectData();
    if (!selectData.length) return;
    selectData.forEach(({ cell, input }) => {
      this._removeSelected(cell);
      this._removeSelected(input);
    });
  }
  //블락 잡힌 범위 cell,input 구해주는 메소드
  _getSelectBlockCells({ cell: firstCell }, { cell: lastCell }) {
    const selectBlockCellList = [];
    const { column: firstColumn, row: firstRow } = this._getLocation(firstCell);
    const { column: lastColumn, row: lastRow } = this._getLocation(lastCell);

    const [minColumn, maxColumn] = [
      Math.min(firstColumn, lastColumn),
      Math.max(firstColumn, lastColumn),
    ];
    const [minRow, maxRow] = [Math.min(firstRow, lastRow), Math.max(firstRow, lastRow)];

    for (let column = minColumn; column <= maxColumn; column++) {
      for (let row = minRow; row <= maxRow; row++) {
        const selectCell = _.$td({ x: column, y: row }, this.sheet);
        const selectInput = selectCell.firstElementChild;
        selectBlockCellList.push({ cell: selectCell, input: selectInput });
      }
    }
    return selectBlockCellList;
  }
  //select-block된 cell,input데이터 모델에 setting
  _setSelectData() {
    const firstData = this.sheetModel.getFirstData();
    const lastData = this.sheetModel.getLastData();
    const selectBlockCellList = this._getSelectBlockCells(firstData, lastData);
    this.sheetModel.setSelectData(selectBlockCellList);
  }
  _getLocation(cell) {
    const { attributes } = cell;
    return { column: attributes.x.value, row: attributes.y.value };
  }
  _toggleSelectStatus() {
    this.isSelectMousedown = !this.isSelectMousedown;
  }
  _toggleDropStatus() {
    this.isDropMousedown = !this.isDropMousedown;
  }
  _isIndexCell(node) {
    const nodeParent = node.parentElement;
    return node.classList.contains('row-index') || nodeParent.classList.contains('column-index');
  }
}

export default SelectEvent;
