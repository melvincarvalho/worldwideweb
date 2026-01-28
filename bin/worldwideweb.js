#!/usr/bin/env node
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Get electron path from the electron package
const electronPath = require('electron');
const mainPath = join(__dirname, '..', 'main.js');

const child = spawn(electronPath, [mainPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

child.on('close', (code) => process.exit(code));
