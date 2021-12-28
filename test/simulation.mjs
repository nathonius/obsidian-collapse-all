// import { writeFileSync } from 'fs';

const tagDepth = 2;
const perLevel = 3;

// Output ['#0/0/0/0', '#0/0/0/1', '#0/0/0/2']

// Utility https://gist.github.com/ssippe/1f92625532eef28be6974f898efb23ef

const f = (a, b) =>
  [].concat(...a.map((a2) => b.map((b2) => [].concat(a2, b2))));

export const cartesianProduct = (a, b, ...c) => {
  if (!b || b.length === 0) {
    return a;
  }
  const [b2, ...c2] = c;
  const fab = f(a, b);
  return cartesianProduct(fab, b2, c2);
};

const cartArray = [];
for (let i = 0; i < perLevel; i++) {
  cartArray.push(i);
}
const cartesianArgs = [];
for (let i = 0; i < tagDepth; i++) {
  cartesianArgs.push(cartArray);
}

// console.log(cartesianArgs);
// console.log(cartesianProduct(...cartesianArgs));

const cartOutput = cartesianProduct(...cartesianArgs);
console.log(cartOutput);
const tags = cartOutput.map((product) => `#${product.join('/')}`);

console.log(tags);
