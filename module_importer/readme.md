A regolith filter for import

## Settings

| Setting           | Type                                                                       | Default                                 | Description                                                 |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `package_path`    | file path                                                                  | "." (project root)                      | Specify the location of the node package and modules folder |
| `native_modules`  | array                                                                      | ["mojang-minecraft", "mojang-gametest"] | import modules that should be ignored by the filter         |
| `compilerOptions` | [compilerOptions](https://www.typescriptlang.org/tsconfig#compilerOptions) | {}                                      | Specifies compiler options for the generated tsconfig.json  |
