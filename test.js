function query(elem, className, list = []) {
  if (!elem) return;
  if (elem.classList.contains(className)) {
    list.push(elem);
    return;
  }

  for (let x of elem.children) {
    query(x, className, list);
  }
  return list;
}

const k = query(document.body, 'f');
console.log(k);
