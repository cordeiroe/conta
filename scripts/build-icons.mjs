import sharp from 'sharp'
import { readFile } from 'fs/promises'

const darkIcon = await readFile('./public/conta-icon-dark.svg')
const maskable = await readFile('./public/conta-maskable.svg')

const sizes = [
  { name: 'pwa-192x192.png', size: 192, source: darkIcon },
  { name: 'pwa-512x512.png', size: 512, source: darkIcon },
  { name: 'apple-touch-icon.png', size: 180, source: darkIcon },
  { name: 'maskable-icon-512x512.png', size: 512, source: maskable },
  { name: 'favicon-32.png', size: 32, source: darkIcon },
  { name: 'favicon-16.png', size: 16, source: darkIcon },
  { name: 'favicon-48.png', size: 48, source: darkIcon },
]

for (const { name, size, source } of sizes) {
  await sharp(source).resize(size, size).png().toFile(`./public/${name}`)
  console.log(`✓ ${name} (${size}x${size})`)
}

console.log('\nDone!')
