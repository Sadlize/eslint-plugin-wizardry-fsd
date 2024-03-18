'use strict';

const micromatch = require('micromatch');
const { getCurrentFileLayer, isPathRelative, getImportPath } = require('../helpers/helpers.js');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restrict imports from higher layer into layer below.',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          alias: { type: 'string' },
          ignoreImportPatterns: { type: 'array' },
          pagesFolderRename: { type: 'string' },
          entitiesCrossImport: { type: 'boolean' },
        },
      },
    ],
    messages: {
      LAYER_IMPORTS:
        '{{layer}} layer can import only below layers: ({{availableLayers}}) https://feature-sliced.design/docs/reference/layers',
    },
  },

  create(context) {
    const {
      alias = '',
      ignoreImportPatterns = [],
      pagesFolderRename = 'pages',
      entitiesCrossImport = false,
    } = context.options[0];

    const interactLayers = {
      app: [pagesFolderRename, 'widgets', 'features', 'entities', 'shared'],
      [pagesFolderRename]: ['widgets', 'features', 'entities', 'shared'],
      widgets: ['features', 'entities', 'shared'],
      features: ['entities', 'shared'],
      entities: [entitiesCrossImport ? 'entities' : undefined, 'shared'],
      shared: ['shared'],
    };

    const layers = new Set(['app', pagesFolderRename, 'widgets', 'features', 'entities', 'shared']);

    return {
      ImportDeclaration(node) {
        const { value } = node.source;
        const { filename } = context;
        const currentFileLayer = getCurrentFileLayer(filename);
        const importPath = getImportPath(value, alias);
        const [importLayer] = importPath.split('/');

        if (isPathRelative(importPath) || !layers.has(currentFileLayer) || !layers.has(importLayer)) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some((pattern) => micromatch.isMatch(importPath, pattern));

        if (isIgnored) {
          return;
        }

        if (!interactLayers[currentFileLayer].includes(importLayer)) {
          context.report({
            node,
            messageId: 'LAYER_IMPORTS',
            data: {
              layer: currentFileLayer.charAt(0).toUpperCase() + currentFileLayer.slice(1),
              availableLayers: interactLayers[currentFileLayer].filter((e) => e !== undefined).join(', '),
            },
          });
        }
      },
    };
  },
};
