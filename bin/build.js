console.log("Building package...");

const sourceHeader = (
    "// github.com/pineapplemachine/strtime-js\n" +
    "// MIT license, Copyright (c) 2018 Sophie Kirschner (sophiek@pineapplemachine.com)\n"
);

const sourceFooter = `
if(typeof(module) !== "undefined"){
    module.exports = strtime;
}else if(typeof(window) !== "undefined"){
    window.strtime = strtime;
}
`;

const fs = require("fs");
const UglifyJS = require("uglify-es");

const sourceDirectoryPath = __dirname + "/../src/";
const releasePath = __dirname + "/../dist/strtime.js";
const uglyPath = __dirname + "/../dist/strtime.min.js";

const sourceOrder = [
    "format-time.js",
    "english.js",
    "directives.js",
    "parse-error.js",
    "parse.js",
    "leap-year.js",
    "month-lengths.js",
    "first-weekday-in-year.js",
    "timezone-names.js",
];

let source = sourceHeader;

function buildSource(content){
    let lastBlank = false;
    return content.split("\n").filter(line => {
        const l = line.trim();
        return (
            (l.indexOf("require\(") < 0) &&
            !l.startsWith("module.exports")
        );
    }).join("\n");
}

console.log("Reading source files.");
for(let sourceFilePath of sourceOrder){
    const path = sourceDirectoryPath + sourceFilePath;
    console.log(`Reading "${path}".`);
    source += buildSource(fs.readFileSync(path, "utf8").toString());
}
source += sourceFooter;

console.log("Writing verbose source to dist/ directory.");
fs.writeFileSync(releasePath, source);

console.log("Uglifying source.");
const uglyResult = UglifyJS.minify(source, {
    mangle: true,
    compress: true,
});
const rawUglySource = uglyResult.code;
if(uglyResult.error){
    console.log("Error uglifying source: " + uglyResult.error);
    process.exit(1);
}

console.log("Writing updated uglified source file.");
const uglySource = sourceHeader + rawUglySource + "\n";
fs.writeFileSync(uglyPath, uglySource);

console.log("Finished building package.");
