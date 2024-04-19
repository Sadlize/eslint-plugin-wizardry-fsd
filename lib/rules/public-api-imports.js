'use strict';

const { isPathRelative, getImportPath } = require('../helpers/helpers.js');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restrict imports only from public API',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      PUBLIC_API_IMPORTS:
        'Absolute import is allowed only from public API (index.ts) https://feature-sliced.design/docs/reference/public-api',
    },
    schema: [
      {
        type: 'object',
        properties: {
          pagesFolderRename: { type: 'string' },
          sharedImportFromAny: { type: 'boolean' },
        },
      },
    ],
  },

  create(context) {
    const { pagesFolderRename = 'pages', sharedImportFromAny = false } = context.options[0] || {};

    const layers = new Set([pagesFolderRename, 'widgets', 'features', 'entities']);

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importPath = getImportPath(value, layers);

        if (isPathRelative(importPath)) {
          return;
        }

        const segments = importPath.split('/');
        const [importLayer, importSegment] = segments;

        if (!layers.has(importLayer)) {
          return;
        }

        if (importLayer === 'shared' && sharedImportFromAny) {
          return;
        }

        const isImportNotFromPublicApi = segments.length > 2;
        if (isImportNotFromPublicApi) {
          context.report({
            node,
            messageId: 'PUBLIC_API_IMPORTS',
            fix: (fixer) =>
              fixer.replaceText(
                node.source,
                `'${node.source.value.match(new RegExp(`.*?(${importSegment})`, 'i'))[0]}'`,
              ),
          });
        }
      },
    };
  },
};
