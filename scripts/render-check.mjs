import sharp from "sharp";
import fs from "fs";
const FULL = fs.readFileSync("dist/react/components/EWBell.js", "utf8");
// Pull out the PLAIN body string (between the const PLAIN = "..." )
const m = FULL.match(/const PLAIN = "([^"]*(?:\\.[^"]*)*)"/);
if (!m) throw new Error("could not extract PLAIN body from EWBell.js");
const plainBody = JSON.parse('"' + m[1] + '"');
const sample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="background:#1a3a2a">${plainBody}</svg>`;
await sharp(Buffer.from(sample)).resize(256, 256).png().toFile("/tmp/plain-bell-15x.png");
console.log("rendered /tmp/plain-bell-15x.png");
