const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");

const defSettings = {
    package_path: ".",
    exclude_modules: [
        "@types/mojang-minecraft",
        "@types/mojang-gametest",
    ],
    silent: true,
    resolve_imports: true,
}
const settings = Object.assign(
    defSettings,
    process.argv[2] ? JSON.parse(process.argv[2]) : {}
);

const included_modules = []
let package;
try {
    package = JSON.parse(fs.readFileSync(`../../${settings.package_path}/package-lock.json`).toString());
} catch (e) {
    console.warn("can't find package-lock.json at project root!");
    return;
}
// add dependencies to output dir
for (const module in package.dependencies) {
    if (defSettings.exclude_modules.includes(module)) {
        continue;
    }
    // cp node_modules/[module_name]/[exports] -> [target]/[exports]
    const module_path = `../../${settings.package_path}/node_modules/${module}`

    let config;
    try {
        config = JSON.parse(fs.readFileSync(`${module_path}/minecraft-module.config.json`).toString());
    } catch (err) {
        // minecraft-module.config.json not found
        if (!settings.silent) {
            console.warn(`unable to resolve module "${module}", ${module}/minecraft-module.config.json not found`);
        }
        continue;
    }

    // copy module files to target
    for (const key in config.exports) {
        fse.copySync(`${module_path}/${key}`, config.exports[key]);
    }
    included_modules.push(module);

    if (!settings.silent) {
        console.log(`resolved module "${module}"`);
    }
}
console.log(included_modules.join("|"));

/**
 * replace all module imports with correct relative imports
 * @param {Error} err 
 * @param {string[]} files_names 
 */
function reImportFile(err, files_names) {
    const depth_offset = 2;
    for (const file_name of files_names) {
        const file = fs.readFileSync(file_name);
        const depth = file_name.split("/").length - depth_offset;
        const changed_file = file.toString().replace(
            new RegExp(`(import|export) ((?:.|\n|\r)*?) from ["'\`](${included_modules.join("|")})["'\`]`, "g"),
            `$1 $2 from "${depth === 0 ? "./" : "../".repeat(depth)}scripts/modules/$3/index.js"`
        )
        fs.writeFileSync(file_name, changed_file);
    }
}

if (settings.resolve_imports) {
    glob("BP/scripts/**/*.ts", { ignore: ["BP/scripts/server/**/*", "BP/scripts/client/**/*"] }, reImportFile);
}
