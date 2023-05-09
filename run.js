#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const electronPath = require('electron')

const appPath = path.join(__dirname, '.')

const child = spawn(electronPath, [appPath], { stdio: 'inherit' })
child.on('close', (code) => {
  process.exit(code)
})
