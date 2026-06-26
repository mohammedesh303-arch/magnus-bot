"use strict";
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const TOKEN = process.argv[2];
const REPO  = process.argv[3];

if (!TOKEN || !REPO) {
  console.error("Usage: node scripts/deploy-github.js <token> <user/repo>");
  process.exit(1);
}

const SRC  = path.resolve(__dirname, "..");
const TMP  = fs.mkdtempSync(path.join(os.tmpdir(), "david-deploy-"));

function run(cmd, cwd) {
  execSync(cmd, { cwd: cwd || TMP, stdio: "inherit" });
}

console.log("📦 Copying project files (including node_modules)...");
const ignore = [".git", ".local", ".upm", ".cache", "attached_assets", "data", "database/data", "node_modules"];
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    try {
      if (fs.statSync(s).isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    } catch (_) {}
  }
}
copyDir(SRC, TMP);

// Write .gitignore that allows node_modules
fs.writeFileSync(path.join(TMP, ".gitignore"), "data/\ndatabase/data/\n.local/\n");

console.log("🔧 Initializing fresh git repo...");
run("git init");
run("git config user.email 'bot@replit.com'");
run("git config user.name 'DAVID V1'");
run("git add -A");
run("git commit -m 'DAVID V1 - Deploy from Replit'");

console.log("🚀 Pushing to GitHub...");
run(`git push https://${TOKEN}@github.com/${REPO}.git main --force`);

console.log(`✅ Done! https://github.com/${REPO}`);

fs.rmSync(TMP, { recursive: true, force: true });
