import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

const XML_DIR = resolve('./xml/mapUS')
const configDir = join(XML_DIR, 'config')

console.log('XML_DIR:', XML_DIR)
console.log('config dir:', configDir)
console.log('XML_DIR exists:', existsSync(XML_DIR))
console.log('config exists:', existsSync(configDir))

if (existsSync(XML_DIR)) {
  console.log('\nFiles in XML_DIR:')
  readdirSync(XML_DIR).forEach(f => console.log(' ', f))
}

if (existsSync(configDir)) {
  console.log('\nFiles in config:')
  readdirSync(configDir).forEach(f => console.log(' ', f))
}

const farmlandsPath = join(configDir, 'farmlands.xml')
console.log('\nfarmlands.xml exists:', existsSync(farmlandsPath))

if (existsSync(farmlandsPath)) {
  const content = readFileSync(farmlandsPath, 'utf8')
  console.log('farmlands.xml first 200 chars:', content.slice(0, 200))
}
