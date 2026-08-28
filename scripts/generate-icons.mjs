import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const svg = readFileSync(join(process.cwd(), 'public/favicon.svg'))
const targets = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(process.cwd(), `public/${name}`))
  console.log(`✓ ${name}`)
}

const maskSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0f172a"/><text x="256" y="312" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif" font-size="240" font-weight="700" fill="#10b981">C</text></svg>`,
)
await sharp(maskSvg).resize(512, 512).png().toFile(join(process.cwd(), 'public/maskable-icon-512x512.png'))
console.log('✓ maskable-icon-512x512.png')