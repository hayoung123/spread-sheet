// const 변수명 = document.querySelector('~~~')

class DomSelector {
  static option = {
    class(target, node) {
      return node.classList.contains(target);
    },
    id(target, node) {
      return node.id === target;
    },
    tag(target, node) {
      return node.tagName.toLowerCase() === target;
    },
  };

  static select(selector, node) {
    const elements = this.searchTarget(selector, node);
    return elements[0];
  }

  static selectAll(selector, node) {
    const elements = this.searchTarget(selector, node, true);
    return elements;
  }

  static searchTarget(target, node, isAll = false, elements = []) {
    const { type, findWord } = this.selectorParser(target);
    if (!node) return;
    if (this.option[type](findWord, node)) {
      elements.push(node);
      if (!isAll) return;
    }
    for (let childNode of node.children) {
      if (!isAll && elements.length) break;
      this.searchTarget(target, childNode, isAll, elements);
    }
    return elements;
  }

  static selectorParser(selector) {
    let parsedSelector;
    if (this.isClass(selector)) {
      parsedSelector = { type: 'class', findWord: selector.slice(1) };
    } else if (this.isId(selector)) {
      parsedSelector = { type: 'id', findWord: selector.slice(1) };
    } else {
      parsedSelector = { type: 'tag', findWord: selector };
    }
    return parsedSelector;
  }

  static isClass(selector) {
    return selector.split('')[0] === '.';
  }
  static isId(selector) {
    return selector.split('')[0] === '#';
  }
}

//test code

const firstADiv = DomSelector.select('.a', document.body);

console.log(firstADiv);
console.log(DomSelector.selectAll('div', firstADiv));
console.log(DomSelector.select('#d', firstADiv));
console.log(DomSelector.selectAll('.a', document.body));
console.log(DomSelector.selectAll('div', document.body));
console.log(DomSelector.select('#v', document.body));
