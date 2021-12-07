A regolith filter for import

## Settings

| Setting           | Type                                                                       | Default                                 | Description                                                 |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `package_path`    | file path                                                                  | "." (project root)                      | Specify the location of the node package and modules folder |
| `exclude_modules`  | string[]                                                                  | ["@types", "minecraft-scripting-types-server", "minecraft-scripting-types-client", "minecraft-scripting-types-shared"] | modules that should be ignored by the filter         |
| `silent` | boolean | true                                      | specify whether module import errors should be logged |
