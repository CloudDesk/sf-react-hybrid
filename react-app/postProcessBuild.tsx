import { exec } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JS_FILE_PATH = path.join(__dirname, "build/static/js/main.js");
const CSS_FILE_PATH = path.join(__dirname, "build/static/css/main.css");
const SRC_PATH = path.join(__dirname, "build/static");
const DEST_PATH = path.join(__dirname, "../force-app/main/default/staticresources/react_app_resources");

async function renameFiles() {
    const [mainJSFile] = await glob(path.join(__dirname, "build/static/js/main*.js"));
    fs.renameSync(mainJSFile, JS_FILE_PATH);

    const [mainCSSFile] = await glob(path.join(__dirname, "build/static/css/main*.css"));
    fs.renameSync(mainCSSFile, CSS_FILE_PATH);
}

function updateJSFile() {
    if (fs.existsSync(JS_FILE_PATH)) {
        let data = fs.readFileSync(JS_FILE_PATH, "utf8");
        data = data.replaceAll('"static/js/"', ' window.resourcePath + "/js/"');
        data = data.replaceAll('"static/css/"', ' window.resourcePath + "/css/"');
        data = data.replaceAll('"static/media', ' window.resourcePath + "/media');
        fs.writeFileSync(JS_FILE_PATH, data);
    }
}

function updateCSSFile() {
    if (fs.existsSync(CSS_FILE_PATH)) {
        let data = fs.readFileSync(CSS_FILE_PATH, "utf8");
        data += "app_flexipage-header{display:none !important}";
        data = data.replace(
            "@import url(https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap);",
            ""
        );
        fs.writeFileSync(CSS_FILE_PATH, data);
    }
}

function copyFiles() {
    exec(`rm -rf ${DEST_PATH}`, (err) => {
        if (err) {
            console.error("Error executing command:", err);
            return;
        }
        fs.cpSync(SRC_PATH, DEST_PATH, { recursive: true });
    });
}

(async function main() {
    await renameFiles();
    updateJSFile();
    updateCSSFile();
    copyFiles();
})();
