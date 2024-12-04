# eslint-plugin-wizardry-fsd

> [!NOTE]
> It is better to use the official FSD linter called [Steiger](https://github.com/feature-sliced/steiger) with many different rules. Install the plugin only if you need Eslint checks or renaming of pages folder.

> `WIP:` Use with caution, the project may not be properly tested.

Plugin for checking import paths in [FSD](https://feature-sliced.design/) project.

Table of Contents:

- [Installation](#installation)
- Supported Rules
  - [slice-relative-path](#slice-relative-path)
  - [public-api-imports](#public-api-imports)
  - [layer-imports](#layer-imports)
  - [complex](#complex-recommended)
- Rules options
  - [Common options for all rules](#common-options-for-all-rules)
  - [layer-imports](#layer-imports-options)
  - [public-api-imports](#public-api-imports-options)
- Setup
  - [Automatic](#automatic)
  - [Manual](#manual)

## Installation

```sh
npm i -D eslint eslint-plugin-wizardy-fsd
```

## Supported Rules

- ### `slice-relative-path`

  Imports within one slice should be relative.

  ```js
  // .
  // └── 📂src/
  //     └── 📂features/                   # FSD layer
  //         └── 📂your-cool-feature/      # FSD slice
  //             ├── 📃file1.ts
  //             └── 📃file2.ts

  // file: src/features/your-cool-feature/file1

  // Examples of incorrect code for this rule:
  import { CoolFeature } from '~/features/your-cool-feature';
  import { CoolFeature } from '@/features/your-cool-feature';
  import { CoolFeature } from '@features/your-cool-feature';
  import { CoolFeature } from '$features/your-cool-feature';
  import { CoolFeature } from 'features/your-cool-feature';

  // Examples of correct code for this rule:
  import { CoolFeature } from '.file2';
  ```

- ### `public-api-imports`

  Absolute imports should be only from public API.

  ```js
  // .
  // └── 📂src/
  //     ├── 📂features/                   # FSD layer
  //     │   └── 📂your-cool-feature/      # FSD slice
  //     │       ├── 📃file1.ts
  //     │       └── 📃file2.ts
  //     └── 📂entities/                   # FSD layer
  //         └── 📂your-important-entity/  # FSD slice
  //             ├── 📂model/
  //             │   └── 📃file3.ts
  //             └── 📃index.ts

  // file: src/features/your-cool-feature/file1

  // Examples of incorrect code for this rule:
  import { ImportantEntity } from 'entities/your-important-entity/model/file3';

  // Examples of correct code for this rule:
  import { ImportantEntity } from 'entities/your-important-entity';

  // Output
  // Absolute import is allowed only from public API (index.ts) https://feature-sliced.design/docs/reference/public-api
  ```

- ### `layer-imports`

  Modules on one layer can only interact with modules from the layers strictly below.

  ```js
  // .
  // └── 📂src/
  //     ├── 📂features/                   # FSD layer
  //     │   └── 📂your-cool-feature/      # FSD slice
  //     │       ├── 📃file1.ts
  //     │       └── 📃file2.ts
  //     │       └── 📃index.ts
  //     └── 📂entities/                   # FSD layer
  //         └── 📂your-important-entity/  # FSD slice
  //             ├── 📃file3.ts
  //             └── 📃index.ts

  // file: src/entities/your-important-entity/file3

  // Examples of incorrect code for this rule:
  import { CoolFeature } from 'features/your-cool-feature/model';

  // Output:
  // Entities layer can import only below layers: (shared) https://feature-sliced.design/docs/reference/layers
  ```

- ### `complex` (recommended)

  All rules above are executed in a single thread, which provides more accurate problem definition.

  ```js
  // .
  // └── 📂src/
  //     └── 📂features/                   # FSD layer
  //         └── 📂your-cool-feature/      # FSD slice
  //             ├── 📃file1.ts
  //             └── 📃file2.ts

  // file: src/features/your-cool-feature/file2
  import { File1 } from 'features/your-cool-feature/file1';

  // Output if you use the rules separately:

  // Within one slice all paths should be relative                                                                                        wizardry-fsd/slice-relative-path
  // Views layer can import only below layers: (widgets, features, entities, shared) https://feature-sliced.design/docs/reference/layers  wizardry-fsd/layer-imports
  // Absolute import is allowed only from public API (index.ts) https://feature-sliced.design/docs/reference/public-api                   wizardry-fsd/public-api-imports

  // Output if you use complex rule:
  // Within one slice all paths should be relative  wizardry-fsd/complex
  ```

## Rules options

### Common options for all rules

- `pagesFolderRename` Useful when we can't use the default folder name for example due to framework limitations like in
  Next.js\
  **Default: "pages"**
  ```json
  {
    "rules": {
      "wizardry-fsd/layer-imports": [
        "error",
        {
          "pagesFolderRename": "views"
        }
      ]
    }
  }
  ```

### layer-imports options

- `entitiesCrossImport` Allows you to import an entity into another entity.\
  **Default: false**
  ```json
  {
    "rules": {
      "wizardry-fsd/layer-imports": [
        "error",
        {
          "entitiesCrossImport": true
        }
      ]
    }
  }
  ```
- `ignoreImportPatterns` Array of glob path templates to ignore of rule.\
  **Default: [ ]**
  ```json
  {
    "rules": {
      "wizardry-fsd/layer-imports": [
        "error",
        {
          "ignoreImportPatterns": ["**/StoreProvider", "**/*.test.*"]
        }
      ]
    }
  }
  ```

### public-api-imports options

- `sharedImportFromAny` Allows you to import from shared as you want, not just from the public api.\
  **Default: false**
  ```json
  {
    "rules": {
      "wizardry-fsd/public-api-imports": [
        "error",
        {
          "sharedImportFromAny": true
        }
      ]
    }
  }
  ```

> ⚠️ You can use all above rules without duplications in `wizardry-fsd/complex`

```json
{
  "rules": {
    "wizardry-fsd/complex": [
      "error",
      {
        "pagesFolderRename": "views",
        "entitiesCrossImport": true,
        "sharedImportFromAny": true,
        "ignoreImportPatterns": ["**/StoreProvider", "**/*.test.*"]
      }
    ]
  }
}
```

## Setup

### Automatic

To use pre-built configurations, you need to add one of the following line to extends:

- `default`
  
  Eslint 8
  ```json
  {
    "extends": ["plugin:wizardry-fsd/default"]
  }
  ```
  which is similar to the following:
  ```json
  {
    "plugins": ["wizardry-fsd"],
    "rules": {
      "wizardry-fsd/complex": [
        "error",
        {
          "sharedImportFromAny": true
        }
      ]
    }
  }
  ```

- `next`
  ```json
  {
    "extends": ["plugin:wizardry-fsd/next"]
  }
  ```
  which is similar to the following:
  ```json
  {
    "plugins": ["wizardry-fsd"],
    "rules": {
      "wizardry-fsd/complex": [
        "error",
        {
          "pagesFolderRename": "views",
          "sharedImportFromAny": true
        }
      ]
    }
  }
  ```

  Eslint 9

  ```js
  import wizardryFsd from 'eslint-plugin-wizardry-fsd';
    
  const config = [
    wizardryFsd.configs.flat.default,
  ];
    
  export default config;
  ```


### Manual

Add `wizardy-fsd` to the plugins section of your `.eslintrc` configuration file:

Eslint 8
```json
{
  "plugins": ["wizardy-fsd"]
}
```
Eslint 9
```js
import wizardryFsd from 'eslint-plugin-wizardry-fsd';

const config = [
  {
    plugins: { 
      'wizardry-fsd': wizardryFsd
    },
  },
];

export default config;

```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "wizardry-fsd/slice-relative-path": [
      "error",
      {
        "pagesFolderRename": "views"
      }
    ],
    "wizardry-fsd/layer-imports": [
      "error",
      {
        "pagesFolderRename": "views",
        "ignoreImportPatterns": ["**/StoreProvider", "**/*.test.*"],
        "entitiesCrossImport": true
      }
    ],
    "wizardry-fsd/public-api-imports": [
      "error",
      {
        "pagesFolderRename": "views",
        "sharedImportFromAny": true
      }
    ]
  }
}
```
