
const fs = require("fs");
const JSZip = require("jszip");

const zip = new JSZip();

const root = __dirname + "/..";

const filenames = [
    "content.js",
    "manifest.json",
    "options.html",
    "options.js",
];

for (const filename of filenames) {
    zip.file(filename, fs.createReadStream(root + `/${filename}`));
}

zip.
    generateNodeStream({
        compression: "DEFLATE",
        streamFiles:true,
    }).
    pipe(fs.createWriteStream("ext.zip")).
    on("finish", () => console.log("done"));
