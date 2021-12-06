const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");

const defSettings = {
    package_path: "",
    native_modules: [
        "mojang-minecraft",
        "mojang-gametest",
    ]
}

const settings = Object.assign(defSettings, JSON.parse(process.argv[2]));

const native_modules_string = settings.native_modules.join("|")

/**
 * replace all module imports with correct relative imports
 * @param {*} err 
 * @param {*} files_names 
 */
function reImportFile(err, files_names) {
    const depth_offset = 3;
    for (const file_name of files_names) {
        console.log(file_name);
        const file = fs.readFileSync(file_name);
        const depth = file_name.split("/").length - depth_offset;
        const changed_file = file.toString().replace(
            new RegExp(`(import|export) (.*) from \"((?!${native_modules_string}|\.\/)[^\/\n]*).*\"`, "g"),
            `$1 $2 from "${depth === 0 ? "./" : "../".repeat(depth)}modules/$3/index.js"`
        )
        fs.writeFileSync(file_name, changed_file);
    }
}

glob("BP/scripts/**/*.js", { ignore: ["BP/scripts/modules/**/*", "BP/scripts/server/**/*", "BP/scripts/client/**/*"] }, reImportFile);

console.log(`package path: |${settings.package_path}|`);

const package = JSON.parse(fs.readFileSync(`../../${settings.package_path}package.json`).toString());

// add dependencies to output dir
for (const module in package.dependencies) {
    // cp node_modules/[module_name]/[exports] -> [target]/[exports]
    const module_path = `../../${settings.package_path}node_modules/${module}`

    const config = JSON.parse(fs.readFileSync(`${module_path}/minecraft-module.config.json`).toString());
    for (const key in config.exports) {
        fse.copySync(`${module_path}/${key}`, config.exports[key]);
    }
}
