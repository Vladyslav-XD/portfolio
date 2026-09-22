import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceExtensions = new Set([".html", ".css", ".js"]);
const ignoredDirectories = new Set([".git", "node_modules"]);

function walk(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) files.push(...walk(absolutePath));
    else files.push(absolutePath);
  }

  return files;
}

function cleanReference(value) {
  return value
    .replaceAll("\\/", "/")
    .replaceAll("\\u002F", "/")
    .replaceAll("&amp;", "&")
    .trim();
}

function isLocalReference(value) {
  return value
    && !value.startsWith("#")
    && !value.startsWith("//")
    && !value.startsWith("/_vercel/")
    && !/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)
    && !value.includes(",")
    && !value.startsWith("new Blob")
    && !value.includes("${")
    && !value.includes("{{");
}

function extractReferences(source) {
  const normalizedSource = source
    .replaceAll('\\\\"', '"')
    .replaceAll("\\\\'", "'")
    .replaceAll("\\\\u002F", "/")
    .replaceAll("\\\\/", "/");
  const references = new Set();
  const patterns = [
    /(?:src|href|poster)=['\"]([^'\"]+)['\"]/gi,
    /srcset=['\"]([^'\"]+)['\"]/gi,
    /url\(["']?([^)"']+)["']?\)/gi,
    /(?:fetch|load)\(["']([^'"]+)["']/gi,
  ];

  for (const pattern of patterns) {
    for (const match of normalizedSource.matchAll(pattern)) {
      const rawValue = cleanReference(match[1]);
      const values = pattern === patterns[1]
        ? rawValue.split(",").map((part) => part.trim().split(/\s+/)[0])
        : [rawValue];

      for (const value of values) {
        if (isLocalReference(value)) references.add(value);
      }
    }
  }

  return [...references];
}

function resolveReference(sourceFile, reference) {
  const withoutFragment = reference.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment) return null;

  let decoded = withoutFragment;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    // Keep the literal path when a URL contains a malformed escape sequence.
  }

  return decoded.startsWith("/")
    ? resolve(repoRoot, `.${decoded}`)
    : resolve(sourceFile, "..", decoded);
}

const sourceFiles = walk(repoRoot).filter((file) => sourceExtensions.has(extname(file)));
const missing = [];
let referenceCount = 0;

for (const sourceFile of sourceFiles) {
  const source = readFileSync(sourceFile, "utf8");

  for (const reference of extractReferences(source)) {
    const target = resolveReference(sourceFile, reference);
    if (!target) continue;
    referenceCount += 1;

    if (!existsSync(target)) {
      missing.push({
        source: relative(repoRoot, sourceFile),
        reference,
      });
    }
  }
}

console.log(`Checked ${sourceFiles.length} source files and ${referenceCount} local references.`);

if (missing.length) {
  console.error(`Found ${missing.length} missing local references:`);
  for (const item of missing) console.error(`- ${item.source}: ${item.reference}`);
  process.exitCode = 1;
} else {
  console.log("All local references resolve to existing files.");
}
