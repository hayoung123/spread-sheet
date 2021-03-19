import { _ } from '../../util/util';
import { parseCellName } from '../util/parser';

const BORDER_STYLE = {
  SOLID: 'solid',
  DOT: 'dot',
};

class SelectEvent {
  constructor({ sheet, model, cellNameBox }) {
    this.sheet = sheet;
    this.sheetModel = model;
    this.cellNameBox = cellNameBox;
    this.originSelectData;
    this.originSelectValue;
    this.firstSelect;
    this.lastSelect;
    this.firstTarget; //drop 첫번째 기준
    this.lastTarget; //drop 마지막 기준
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
    if (!this._isParentTd(target) && this._isSelect()) this._dragDropMousedown(target);
    else this._dragSelectMousedown(target);
  }
  handleMouseover({ target }) {
    if (!this._isParentTd(target)) return;
    if (this.isSelectMousedown) this._dragSelectMouseover(target);
    if (this.isDropMousedown) this._dragDropMouseover(target);
  }
  handleMouseup({ target }) {
    if (this.isSelectMousedown) this._dragSelectMouseup(target);
    if (this.isDropMousedown) this._dragDropMouseup(target);
  }
  _dragSelectMousedown(target) {
    this._toggleSelectStatus();
    this._clearSelectCell();
    this._clearBorder(BORDER_STYLE.SOLID);
    this._setFirstSelectData(target);
    this._setLastSelectData(target);
    this._setSelectData();
    this._selectCell();
  }
  _dragSelectMouseover(target) {
    this._clearSelectCell();
    this._setLastSelectData(target);
    this._setSelectData();
    this._selectCell();
  }
  _dragSelectMouseup() {
    this._toggleSelectStatus();
    this._setBorder(BORDER_STYLE.SOLID);
    this._setCellNameBox();
  }
  _dragDropMousedown(target) {
    this._toggleDropStatus();
    this._setFirstTargetData(target);
    this._setOriginSelectData();
  }
  _dragDropMouseover(target) {
    this._clearBorder(BORDER_STYLE.DOT);
    this._setLastTargetData(target);
    this._setMovedFirstLastSelect();
    this._setSelectData();
    this._setBorder(BORDER_STYLE.DOT);
    this._setFirstTargetData(target);
  }
  _dragDropMouseup() {
    this._toggleDropStatus();
    this._clearOriginSelectCell();
    this._clearOriginSelectValue();
    this._clearBorder(BORDER_STYLE.DOT);
    this._setValueSelectData(this.originSelectValue); //기존 valuedata를 적용하기(copy)
    this._selectCell();
    this._setCellNameBox();
  }
  _selectCell() {
    const selectData = this.sheetModel.getSelectData();
    selectData.forEach(({ cell, input }) => this._addStyle('selected', cell, input));
  }
  //select cell들 .selected 클래스 제거
  _clearSelectCell() {
    const selectData = this.sheetModel.getSelectData();
    if (!selectData.length) return;
    selectData.forEach(({ cell, input }) => this._removeStyle('selected', cell, input));
  }
  _clearOriginSelectCell() {
    this.originSelectData.forEach(({ cell, input }) => {
      this._removeStyle('selected', cell, input);
      this._removeBorder(BORDER_STYLE.SOLID, cell);
    });
  }
  _clearOriginSelectValue() {
    this.originSelectData.forEach(({ input }) => (input.value = ''));
  }
  _clearBorder(style) {
    const selectData = this.sheetModel.getSelectData();
    if (!selectData.length) return;
    selectData.forEach(({ cell }) => this._removeBorder(style, cell));
  }
  //블락 잡힌 범위 cell,input 구해주는 메소드
  _getBlockCells() {
    const selectBlockCellList = [];
    const { top: minRow, bottom: maxRow, left: minColumn, right: maxColumn } = this._getSideIndex();
    for (let column = minColumn; column <= maxColumn; column++) {
      for (let row = minRow; row <= maxRow; row++) {
        const selectCell = _.$td({ x: column, y: row }, this.sheet);
        const selectInput = selectCell.firstElementChild;
        selectBlockCellList.push({ cell: selectCell, input: selectInput });
      }
    }
    return selectBlockCellList;
  }
  _getMoveIndex() {
    const { column: firstColumn, row: firstRow } = this._getLocation(this.firstTarget.cell);
    const { column: lastColumn, row: lastRow } = this._getLocation(this.lastTarget.cell);
    const moveIndex = { column: lastColumn - firstColumn, row: lastRow - firstRow };
    return moveIndex;
  }
  _setMovedFirstLastSelect() {
    const { column: moveColumn, row: moveRow } = this._getMoveIndex();
    const { column: firstColumn, row: firstRow } = this._getLocation(this.firstSelect.cell);
    const { column: lastColumn, row: lastRow } = this._getLocation(this.lastSelect.cell);
    const newFirstCell = _.$td(
      { x: firstColumn * 1 + moveColumn, y: firstRow * 1 + moveRow },
      this.sheet
    );
    const newLastCell = _.$td(
      { x: lastColumn * 1 + moveColumn, y: lastRow * 1 + moveRow },
      this.sheet
    );
    this.firstSelect = this._getNodeData(newFirstCell);
    this.lastSelect = this._getNodeData(newLastCell);
  }
  _setBorder(style) {
    const selectData = this.sheetModel.getSelectData();
    const sideIndex = this._getSideIndex();
    selectData.forEach(({ cell }) => {
      const { column, row } = this._getLocation(cell);
      if (column * 1 === sideIndex.left) this._addStyle(`left-${style}`, cell);
      if (column * 1 === sideIndex.right) this._addStyle(`right-${style}`, cell);
      if (row * 1 === sideIndex.top) this._addStyle(`top-${style}`, cell);
      if (row * 1 === sideIndex.bottom) this._addStyle(`bottom-${style}`, cell);
    });
  }
  _getSideIndex() {
    const { column: firstColumn, row: firstRow } = this._getLocation(this.firstSelect.cell);
    const { column: lastColumn, row: lastRow } = this._getLocation(this.lastSelect.cell);
    const minRow = Math.min(firstRow, lastRow); //border-top
    const maxRow = Math.max(firstRow, lastRow); //border-bottom
    const minColumn = Math.min(firstColumn, lastColumn); //border-left
    const maxColumn = Math.max(firstColumn, lastColumn); //border-right
    const sideIndex = { top: minRow, bottom: maxRow, left: minColumn, right: maxColumn };
    return sideIndex;
  }
  // select-block된 cell,input데이터 모델에 setting
  _setSelectData() {
    const selectBlockCellList = this._getBlockCells();
    this.sheetModel.setSelectData(selectBlockCellList);
  }
  _setValueSelectData(valueData) {
    const selectData = this.sheetModel.getSelectData();
    valueData.forEach((data, idx) => (selectData[idx].input.value = data));
  }
  _setOriginSelectData() {
    this.originSelectData = this.sheetModel.getSelectData();
    this.originSelectValue = this.originSelectData
      .map((data) => data.input.value)
      .reduce((acc, value) => {
        acc.push(value);
        return acc;
      }, []);
  }
  _setFirstSelectData(node) {
    this.firstSelect = this._getNodeData(node);
  }
  _setLastSelectData(node) {
    this.lastSelect = this._getNodeData(node);
  }
  _setFirstTargetData(node) {
    this.firstTarget = this._getNodeData(node);
  }
  _setLastTargetData(node) {
    this.lastTarget = this._getNodeData(node);
  }
  _getLocation(cell) {
    const { attributes } = cell;
    return { column: attributes.x.value, row: attributes.y.value };
  }
  _isParentTd(node) {
    if (!node.parentElement) return;
    return node.parentElement.tagName === 'TD';
  }
  _isSelect() {
    return this.firstSelect && this.lastSelect;
  }
  _removeBorder(style, ...nodes) {
    const solidBorderList = ['top-solid', 'bottom-solid', 'right-solid', 'left-solid'];
    const dotBorderList = ['top-dot', 'bottom-dot', 'right-dot', 'left-dot'];
    if (style === BORDER_STYLE.SOLID)
      nodes.forEach((node) => node.classList.remove(...solidBorderList));
    if (style === BORDER_STYLE.DOT)
      nodes.forEach((node) => node.classList.remove(...dotBorderList));
  }
  _addStyle(style, ...nodes) {
    nodes.forEach((node) => node.classList.add(style));
  }
  _removeStyle(style, ...nodes) {
    nodes.forEach((node) => node.classList.remove(style));
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
  _getNodeData(node) {
    if (this._isParentTd(node)) {
      const input = node;
      const cell = node.parentElement;
      return { cell, input };
    } else {
      const input = node.firstElementChild;
      const cell = node;
      return { cell, input };
    }
  }
  _setCellNameBox() {
    if (!this._isSelect()) return;
    const { column: firstColumn, row: firstRow } = this._getLocation(this.firstSelect.cell);
    const { column: lastColumn, row: lastRow } = this._getLocation(this.lastSelect.cell);
    const firstCellName = parseCellName(firstColumn, firstRow);
    const lastCellName = parseCellName(lastColumn, lastRow);
    if (firstCellName === lastCellName) this.cellNameBox.innerHTML = firstCellName;
    else this.cellNameBox.innerHTML = `${firstCellName}:${lastCellName}`;
  }
}

export default SelectEvent;
