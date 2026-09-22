import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const textExtensions = new Set([".html", ".js", ".md", ".txt"]);

function destinationFor(fileName) {
  const extension = extname(fileName).toLowerCase();

  if (["support.js", "image-slot.js", "vf-analytics.js", "vf-shared.js"].includes(fileName)) {
    return "assets/js/" + fileName;
  }
  if (["favicon.png", "og-cover.png", "og-image.png"].includes(fileName)) {
    return "assets/meta/" + fileName;
  }
  if (fileName === "cv-vlad-filon.pdf") {
    return "assets/documents/" + fileName;
  }
  if (/^art-/.test(fileName) && [".jpg", ".jpeg", ".png"].includes(extension)) {
    return "assets/images/art/" + fileName;
  }
  if (/^bw-/.test(fileName)) {
    return "assets/images/bookworm-community/" + fileName;
  }
  if (/^charon-/.test(fileName)) {
    return "assets/images/charon/" + fileName;
  }
  if (/^(cat-|end-|portrait-|testi-|wa-qr)/.test(fileName)) {
    return "assets/images/home/" + fileName;
  }
  if (/^(mep-|pharm-logo)/.test(fileName)) {
    return extension === ".mp4"
      ? "assets/video/my-eco-pharmacy/" + fileName
      : "assets/images/my-eco-pharmacy/" + fileName;
  }
  if (/^mf-/.test(fileName)) {
    return "assets/images/mocktail-finder/" + fileName;
  }
  if (fileName === "mocktail-demo4.mp4") {
    return "assets/video/mocktail-finder/" + fileName;
  }
  if (/^rp-/.test(fileName)) {
    return "assets/images/race-planner/" + fileName;
  }
  if (/^trt-/.test(fileName)) {
    return "assets/images/tverdokhlib/" + fileName;
  }
  if (/^logo-mono/.test(fileName)) {
    return "assets/images/brand/" + fileName;
  }

  return null;
}

const rootEntries = readdirSync(repoRoot);
const moves = [];

for (const entry of rootEntries) {
  const sourcePath = join(repoRoot, entry);
  if (!statSync(sourcePath).isFile()) continue;
  const destination = destinationFor(entry);
  if (destination) moves.push({ source: entry, destination });
}

const expectedAssetExtensions = new Set([".jpg", ".jpeg", ".png", ".svg", ".mp4", ".pdf"]);
const unmappedAssets = rootEntries.filter((entry) => {
  const absolutePath = join(repoRoot, entry);
  return statSync(absolutePath).isFile()
    && expectedAssetExtensions.has(extname(entry).toLowerCase())
    && !moves.some((move) => move.source === entry);
});

if (unmappedAssets.length) {
  throw new Error("Unmapped root assets: " + unmappedAssets.join(", "));
}

const rootTextFiles = rootEntries.filter((entry) => {
  const absolutePath = join(repoRoot, entry);
  return statSync(absolutePath).isFile() && textExtensions.has(extname(entry).toLowerCase());
});

const directoryMoves = [
  {
    sourcePrefix: "ca-ev/",
    sourceDirectory: "ca-ev",
    destinationDirectory: "assets/images/coffee-audit",
  },
];

for (const textFile of rootTextFiles) {
  const absolutePath = join(repoRoot, textFile);
  let content = readFileSync(absolutePath, "utf8");
  let changed = false;

  for (const move of moves) {
    if (!content.includes(move.source)) continue;
    content = content.replaceAll(move.source, move.destination);
    changed = true;
  }

  for (const move of directoryMoves) {
    if (!content.includes(move.sourcePrefix)) continue;
    content = content.replaceAll(move.sourcePrefix, move.destinationDirectory + "/");
    changed = true;
  }

  if (changed) writeFileSync(absolutePath, content);
}

for (const move of moves) {
  const sourcePath = join(repoRoot, move.source);
  const destinationPath = join(repoRoot, move.destination);
  mkdirSync(resolve(destinationPath, ".."), { recursive: true });
  renameSync(sourcePath, destinationPath);
}

for (const move of directoryMoves) {
  const sourceDirectory = join(repoRoot, move.sourceDirectory);
  if (!existsSync(sourceDirectory)) continue;
  const destinationDirectory = join(repoRoot, move.destinationDirectory);
  mkdirSync(destinationDirectory, { recursive: true });

  for (const entry of readdirSync(sourceDirectory)) {
    renameSync(join(sourceDirectory, entry), join(destinationDirectory, basename(entry)));
  }
}

console.log("Moved " + moves.length + " root assets into project folders.");
console.log("Updated references in: " + rootTextFiles.join(", "));
