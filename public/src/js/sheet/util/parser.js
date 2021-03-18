export const parseCellName = (column, row) => {
  const columnAsciiNum = 'A'.charCodeAt() + column * 1 - 1;
  const cellName = String.fromCharCode(columnAsciiNum) + row;
  return cellName;
};
