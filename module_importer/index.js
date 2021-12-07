const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");

const defSettings = {
    package_path: ".",
    exclude_modules: [ // seems to be never used
        "@types",
        ""
    ],
    silent: true,
}
const settings = Object.assign(
    defSettings,
    process.argv[2] ? JSON.parse(process.argv[2]) : {}
);

const included_modules = []

const package = JSON.parse(fs.readFileSync(`../../${settings.package_path}/package.json`).toString());
// add dependencies to output dir
for (const module in package.dependencies) {
    // cp node_modules/[module_name]/[exports] -> [target]/[exports]
    const module_path = `../../${settings.package_path}/node_modules/${module}`

    let config;
    try {
        config = JSON.parse(fs.readFileSync(`${module_path}/minecraft-module.config.json`).toString());
    } catch (err) {
        // minecraft-module.config.json not found
        if (!settings.silent) {
            console.warn(`unable to resolve module "${module}", ${module}/minecraft-module.config.json not found`);
            continue;
        }
    }
    // copy module files to target
    for (const key in config.exports) {
        console.log(key);
        fse.copySync(`${module_path}/${key}`, config.exports[key]);
    }
    included_modules.push(module);
    if (!settings.silent) {
        console.log(`resolved module "${module}"`);
    }
}

/**
 * replace all module imports with correct relative imports
 * @param {Error} err 
 * @param {string[]} files_names 
 */
function reImportFile(err, files_names) {
    const depth_offset = 3;
    for (const file_name of files_names) {
        const file = fs.readFileSync(file_name);
        const depth = file_name.split("/").length - depth_offset;
        const changed_file = file.toString().replace(
            new RegExp(`(import|export) (.*) from \"(${included_modules.join("|")})\"`, "g"),
            `$1 $2 from "${depth === 0 ? "./" : "../".repeat(depth)}modules/$3/index.js"`
        )
        fs.writeFileSync(file_name, changed_file);
    }
}

glob("BP/scripts/**/*.ts", { ignore: ["BP/scripts/server/**/*", "BP/scripts/client/**/*"] }, reImportFile);

