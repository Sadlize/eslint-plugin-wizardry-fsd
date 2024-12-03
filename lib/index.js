'use strict';

const requireIndex = require('requireindex');

// for legacy config system
const plugins = ['wizardry-fsd'];

const plugin = {
  rules: requireIndex(__dirname + '/rules'),
  configs: {
    default: {
      plugins,
      rules: {
        'wizardry-fsd/complex': [
          'error',
          {
            sharedImportFromAny: true,
          },
        ],
      },
    },
    next: {
      plugins,
      rules: {
        'wizardry-fsd/complex': [
          'error',
          {
            pagesFolderRename: 'views',
            sharedImportFromAny: true,
          },
        ],
      },
    },
  },
};

plugin.configs.flat = {
  default: {
    plugins: { 'wizardry-fsd': plugin },
    rules: plugin.configs.default.rules,
  },
  next: {
    plugins: { 'wizardry-fsd': plugin },
    rules: plugin.configs.next.rules,
  },
};

module.exports = plugin;
