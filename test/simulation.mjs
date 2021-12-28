import { writeFileSync } from 'fs';

const tagDepth = 6 - 2;
const perLevel = 9;
const outputPath = '/mnt/c/Users/Nathan/Documents/test-vault/tagtesting';

// Output ['#0/0/0/0', '#0/0/0/1', '#0/0/0/2']

// Utility https://gist.github.com/ssippe/1f92625532eef28be6974f898efb23ef

// const f = (a, b) =>
//   [].concat(...a.map((a2) => b.map((b2) => [].concat(a2, b2))));

// export const cartesianProduct = (a, b, ...c) => {
//   if (!b || b.length === 0) {
//     return a;
//   }
//   const [b2, ...c2] = c;
//   const fab = f(a, b);
//   return cartesianProduct(fab, b2, c2);
// };

// JS Solution https://stackoverflow.com/a/43053803

const f = (a, b) => [].concat(...a.map((d) => b.map((e) => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

// [0-9]
const cartArray = [];
for (let i = 0; i < perLevel; i++) {
  cartArray.push(i);
}

// [0-9], [0-9], [0-9]
const cartesianArgs = [];
for (let i = 0; i < tagDepth; i++) {
  cartesianArgs.push(cartArray);
}

// // [0-9]
// const cartArray = [];
// for (let i = 0; i < perLevel; i++) {
//   cartArray.push(i);
// }

// // [0-9], [0-9], [0-9]
// const cartesianArgs = [];
// for (let i = 0; i < (tagDepth - 2); i++) {
//   cartesianArgs.push(cartArray);
// }
console.log('Cartesian Product Arguments');
console.log(cartesianArgs);
const cartOutput = cartesian(...cartesianArgs);
console.log('\n\nCartesian Product Output');
console.log(cartOutput[0]);
const tags = cartOutput.map((product) => product.join('/'));
// TODO: Make sure to Math.max / Math.min to ensure we don't try and generate more files than tags
// const tagsPerFile = Math.floor(Math.max(1, tags.length / totalFiles));

// for i in 0-9
// for j in 0-9
// cartesian on tagDepth - 2
//  create a file called ij.md
//  write to that file i/j/..tags

console.log('\n\nFirst Tag');
console.log(tags[0]);

for (let i = 0; i < perLevel; i++) {
  for (let j = 0; j < perLevel; j++) {
    const tagsForThisFile = tags.map((tag) => `#${i}/${j}/${tag}`);
    writeFileSync(
      `${outputPath}/${i}-${j}-tags.md`,
      tagsForThisFile.join('\n')
    );
  }
}

// writeFileSync(`${outputPath}/lots-of-tags.md`, tags.join('\n'));
