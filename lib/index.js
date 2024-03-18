'use strict';

const requireIndex = require('requireindex');

module.exports = {
  rules: requireIndex(__dirname + '/rules'),
  configs: {
    default: {
      plugins: ['wizardry-fsd'],
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
      plugins: ['wizardry-fsd'],
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
