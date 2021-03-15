const ASCII = {
  A: 65,
  Z: 90,
};

class SheetModel {
  constructor() {
    this.maxRow = 50;
    this.sheetData;
    this.init();
  }
  init() {
    this.setsheetData();
    this.setColumnIndex();
  }
  setColumnIndex() {
    const total = ASCII.Z - ASCII.A + 1;
    const columnIndexArr = new Array(total + 1)
      .fill('')
      .map((_, idx) => (idx ? String.fromCharCode(ASCII.A + idx - 1) : ''));
    this.sheetData[0] = columnIndexArr;
  }
  getColumnIndex() {
    return this.sheetData[0];
  }
  //maxRow-row, totalColumn-column 만드는 메소드
  setsheetData() {
    //Max+1: column index 넣기 위한 자리 / total+1: row index 넣기 위한 자리
    const totalColumn = ASCII.Z - ASCII.A + 1;
    this.sheetData = Array.from(Array(this.maxRow + 1), (_, idx) =>
      new Array(totalColumn + 1).fill('').map((_, i) => (i ? '' : idx))
    );
  }
  getSheetData() {
    return this.sheetData;
  }
  setData(row, col, value) {
    this.sheetData[row][col] = value;
    return value;
  }
  getData(row, col) {
    return this.sheetData[row][col];
  }
}

export default SheetModel;
