#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildIndexPath = join(__dirname, '..', 'build', 'index.js');

// Read the generated build/index.js
let content = readFileSync(buildIndexPath, 'utf-8');

// Check if dotenv is already injected (to avoid double injection)
if (content.includes('dotenv/config')) {
  console.log('✓ dotenv already injected in build/index.js');
  process.exit(0);
}

// Inject dotenv import at the very top
const dotenvImport = "import 'dotenv/config';\n";
content = dotenvImport + content;

// Write back the modified file
writeFileSync(buildIndexPath, content, 'utf-8');

console.log('✓ Injected dotenv/config into build/index.js');
