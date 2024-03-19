const isPathRelative = (path) => path === '.' || path.startsWith('./') || path.startsWith('../');

const normalizePath = (from, path) => path.toNamespacedPath(from).replace(/\\/g, '/').split('src')[1];

const getCurrentFileLayer = (currentFilePath) => {
  const fsdPath = currentFilePath.replace(/\\/g, '/').split('src')[1];

  if (!fsdPath) {
    return null;
  }

  return currentFilePath.replace(/\\/g, '/').split('src')[1].split('/')[1];
};

const getImportPath = (value, alias) => (alias ? value.replace(`${alias}/`, '') : value);

const shouldBeRelative = (layers, from, to) => {
  if (isPathRelative(to)) {
    return false;
  }

  const path = require('path');
  const toArray = to.split('/');
  const [toLayer, toSlice] = toArray;

  if (!toLayer || !toSlice || !layers.has(toLayer)) {
    return false;
  }

  const projectFrom = normalizePath(from, path);
  const fromArray = projectFrom.split('/');
  const [, fromLayer, fromSlice] = fromArray;

  if (!fromLayer || !fromSlice || !layers.has(fromLayer)) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
};

module.exports = {
  isPathRelative,
  normalizePath,
  getCurrentFileLayer,
  getImportPath,
  shouldBeRelative,
};
