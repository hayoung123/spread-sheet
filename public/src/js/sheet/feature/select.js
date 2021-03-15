class Select {
  constructor(sheet) {
    this.sheet = sheet;
    this.isMouseDown = false;
    this.startRowIndex = null;
    this.startCellIndex = null;
    this.selectData = [];
    this.init();
  }
  init() {
    this.addEvent();
  }
  addEvent() {
    this.sheet.addEventListener('mousedown', this.handleMousedown.bind(this));
    this.sheet.addEventListener('mousemove', this.handleMousemove.bind(this));
    this.sheet.addEventListener('mouseup', this.handleMouseup.bind(this));
  }
  handleMousedown({ target }) {
    if (!this._isParentTd(target)) return;
    this.isMouseDown = true;
    this._addSelected(target);
  }
  handleMousemove({ target }) {
    if (!this.isMouseDown || !this._isParentTd(target)) return;
    this._addSelected(target);
  }
  handleMouseup({ target }) {
    this.isMouseDown = false;
    if (!this.isMouseDown || !this._isParentTd(target)) return;
    this._addSelected(target);
  }
  _isParentTd(node) {
    return node.parentElement.tagName === 'TD';
  }
  _addSelected(node) {
    node.classList.add('selected');
    node.parentElement.classList.add('selected');
  }
}

export default Select;
