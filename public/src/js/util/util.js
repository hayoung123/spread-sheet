export const _ = {
  $: function (selector, base = document) {
    return base.querySelector(selector);
  },
  $All: function (selector, base = document) {
    return base.querySelectorAll(selector);
  },
};

export const getData = (url) => fetch(url).then((res) => res.json());

export const createDom = (tag) => ({ value = '', classes = [] } = {}) =>
  `<${tag} class='${classes.join(' ')}'>${value}</${tag}>`;

export const delay = (ms, value = '') =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const debounceInit = (timer = null) => (fn, wait) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(fn, wait);
};

export const debounce = debounceInit();

export const add = (a, b) => a + b;
