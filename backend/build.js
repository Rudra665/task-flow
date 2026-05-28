import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve("src");

if (!fs.existsSync(srcDir)) {
	throw new Error(`Build failed: source directory not found at ${srcDir}`);
}

console.log(
	"✅ Backend build check complete (no transpilation required for this project).",
);
