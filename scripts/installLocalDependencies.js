const { exec } = require('child_process')
const path = require('path')

const dependencyDir = path.join(__dirname, '..', 'local-dependencies', '*')
exec(`npm install ${dependencyDir}`).stdout.pipe(process.stdout)
