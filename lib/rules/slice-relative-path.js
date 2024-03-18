'use strict';

const path = require('path');
const { normalizePath, shouldBeRelative, getImportPath } = require('../helpers/helpers.js');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'feature sliced slice relative path checker',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: { type: 'string' },
          pagesFolderRename: { type: 'string' },
        },
      },
    ],
    messages: {
      SLICE_RELATIVE_PATH: 'Within one slice all paths should be relative.',
    },
  },
  create(context) {
    const { alias = '', pagesFolderRename = 'pages' } = context.options[0];
    const layers = new Set(['app', pagesFolderRename, 'widgets', 'features', 'entities', 'shared']);

    return {
      ImportDeclaration(node) {
        try {
          const { value } = node.source;
          const importPath = getImportPath(value, alias);

          const { filename } = context;

          if (shouldBeRelative(layers, filename, importPath)) {
            context.report({
              node,
              messageId: 'SLICE_RELATIVE_PATH',
              fix: (fixer) => {
                const projectFrom = normalizePath(filename, path);
                const newPath = projectFrom.split('/').slice(0, -1).join('/');

                let relativePath = path.relative(newPath, `/${importPath}`).replace(/\\/g, '/');

                if (!relativePath.startsWith('.')) {
                  relativePath = './' + relativePath;
                }

                return fixer.replaceText(node.source, `'${relativePath}'`);
              },
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
    };
  },
};
