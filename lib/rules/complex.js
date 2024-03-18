'use strict';

const micromatch = require('micromatch');
const {
  getCurrentFileLayer,
  isPathRelative,
  normalizePath,
  getImportPath,
  shouldBeRelative,
} = require('../helpers/helpers.js');
const path = require('path');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restrict imports from higher layer into layer below.',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: { type: 'string' },
          ignoreImportPatterns: { type: 'array' },
          pagesFolderRename: { type: 'string' },
          entitiesCrossImport: { type: 'boolean' },
          sharedImportFromAny: { type: 'boolean' },
        },
      },
    ],
    messages: {
      LAYER_IMPORTS: '{{layer}} layer can import only below layers: ({{availableLayers}})',
      SLICE_RELATIVE_PATH: 'Within one slice all paths should be relative.',
      PUBLIC_API_IMPORTS: 'Absolute import is allowed only from public API (index.ts).',
    },
  },

  create(context) {
    const {
      alias = '',
      ignoreImportPatterns = [],
      pagesFolderRename = 'pages',
      entitiesCrossImport = false,
      sharedImportFromAny = false,
    } = context.options[0];

    const layers = new Set(['app', pagesFolderRename, 'widgets', 'features', 'entities', 'shared']);

    return {
      ImportDeclaration(node) {
        const { value } = node.source;
        const { filename } = context;
        const currentFileLayer = getCurrentFileLayer(filename);
        const importPath = getImportPath(value, alias);
        const segments = importPath.split('/');
        const [importLayer, importSegment] = segments;

        if (shouldBeRelative(layers, filename, importPath)) {
          return context.report({
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

        if (isPathRelative(value) || !layers.has(currentFileLayer) || !layers.has(importLayer)) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some((pattern) => micromatch.isMatch(value, pattern));
        if (isIgnored) {
          return;
        }

        const interactLayers = {
          app: [pagesFolderRename, 'widgets', 'features', 'entities', 'shared'],
          [pagesFolderRename]: ['widgets', 'features', 'entities', 'shared'],
          widgets: ['features', 'entities', 'shared'],
          features: ['entities', 'shared'],
          entities: [entitiesCrossImport ? 'entities' : undefined, 'shared'],
          shared: ['shared'],
        };

        if (!interactLayers[currentFileLayer].includes(importLayer)) {
          return context.report({
            node,
            messageId: 'LAYER_IMPORTS',
            data: {
              layer: currentFileLayer.charAt(0).toUpperCase() + currentFileLayer.slice(1),
              availableLayers: interactLayers[currentFileLayer].filter((e) => e !== undefined).join(', '),
            },
          });
        }

        if (importLayer === 'shared' && sharedImportFromAny) {
          return;
        }

        const isImportNotFromPublicApi = segments.length > 2;
        if (isImportNotFromPublicApi) {
          return context.report({
            node,
            messageId: 'PUBLIC_API_IMPORTS',
            fix: (fixer) =>
              fixer.replaceText(node.source, `'${alias ? alias + '/' : ''}${importLayer}/${importSegment}'`),
          });
        }
      },
    };
  },
};
